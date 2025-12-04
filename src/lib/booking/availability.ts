// lib/booking/availability.ts

import { prisma } from '@/lib/prisma';

interface Timeslot {
  timeInMinutes: number;
  timeString: string;
  availableTables: number;
}

/**
 * Check if restaurant is open on a given date
 */
export async function isRestaurantOpen(
  restaurantId: string,
  date: Date
): Promise<boolean> {
  // Check for special hours (holidays, closures)
  const specialHours = await prisma.specialHours.findUnique({
    where: {
      restaurantId_date: {
        restaurantId,
        date: new Date(date.toISOString().split('T')[0])
      }
    }
  });
  
  if (specialHours) {
    return !specialHours.isClosed;
  }
  
  // Check regular opening hours
  const dayOfWeek = date.getDay();
  const openingHours = await prisma.openingHours.findUnique({
    where: {
      restaurantId_dayOfWeek: {
        restaurantId,
        dayOfWeek
      }
    },
    include: {
      periods: true
    }
  });
  
  return openingHours?.isOpen && openingHours.periods.length > 0;
}

/**
 * Get all available timeslots for a date and party size
 */
export async function getAvailableTimeslots(
  restaurantId: string,
  date: Date,
  partySize: number
): Promise<Timeslot[]> {
  // Get restaurant settings
  const settings = await prisma.bookingSettings.findUnique({
    where: { restaurantId }
  });
  
  const timeSlotInterval = settings?.timeSlotInterval || 15;
  
  // Get opening hours for this date
  const servicePeriods = await getServicePeriods(restaurantId, date);
  
  if (servicePeriods.length === 0) {
    return [];
  }
  
  // Generate all possible timeslots
  const allTimeslots: Timeslot[] = [];
  
  for (const period of servicePeriods) {
    const startMinutes = timeToMinutes(period.startTime);
    const endMinutes = timeToMinutes(period.lastSeating || period.endTime);
    
    for (let minutes = startMinutes; minutes <= endMinutes; minutes += timeSlotInterval) {
      // Check if this timeslot has available tables
      const availableTables = await checkTableAvailability(
        restaurantId,
        date,
        minutes,
        partySize
      );
      
      if (availableTables > 0) {
        allTimeslots.push({
          timeInMinutes: minutes,
          timeString: minutesToTime(minutes),
          availableTables
        });
      }
    }
  }
  
  return allTimeslots;
}

/**
 * Check how many tables are available for a specific timeslot
 */
export async function checkTableAvailability(
  restaurantId: string,
  date: Date,
  timeInMinutes: number,
  partySize: number
): Promise<number> {
  const dateStr = date.toISOString().split('T')[0];
  const timeString = minutesToTime(timeInMinutes);
  
  // Get all suitable tables
  const suitableTables = await prisma.table.findMany({
    where: {
      restaurantId,
      isActive: true,
      capacity: {
        gte: partySize
      },
      minCapacity: {
        lte: partySize
      }
    }
  });
  
  if (suitableTables.length === 0) {
    return 0;
  }
  
  // Get booking duration
  const settings = await prisma.bookingSettings.findUnique({
    where: { restaurantId }
  });
  const bookingDuration = settings?.bookingDuration || 120;
  
  // Check for conflicts with existing bookings
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      restaurantId,
      bookingDate: new Date(dateStr),
      status: {
        in: ['PENDING', 'CONFIRMED', 'SEATED']
      },
      tableId: {
        in: suitableTables.map(t => t.id)
      }
    }
  });
  
  // Filter out tables that have conflicts
  const availableTables = suitableTables.filter(table => {
    const tableBookings = conflictingBookings.filter(b => b.tableId === table.id);
    
    return !tableBookings.some(booking => {
      const bookingStartMinutes = timeToMinutes(booking.bookingTime);
      const bookingEndMinutes = bookingStartMinutes + booking.duration;
      const requestedEndMinutes = timeInMinutes + bookingDuration;
      
      // Check if times overlap
      return (
        (timeInMinutes >= bookingStartMinutes && timeInMinutes < bookingEndMinutes) ||
        (requestedEndMinutes > bookingStartMinutes && requestedEndMinutes <= bookingEndMinutes) ||
        (timeInMinutes <= bookingStartMinutes && requestedEndMinutes >= bookingEndMinutes)
      );
    });
  });
  
  return availableTables.length;
}

/**
 * Get service periods for a specific date
 */
async function getServicePeriods(restaurantId: string, date: Date) {
  // Check for special hours first
  const specialHours = await prisma.specialHours.findUnique({
    where: {
      restaurantId_date: {
        restaurantId,
        date: new Date(date.toISOString().split('T')[0])
      }
    }
  });
  
  if (specialHours) {
    if (specialHours.isClosed) {
      return [];
    }
    if (specialHours.openTime && specialHours.closeTime) {
      return [{
        startTime: specialHours.openTime,
        endTime: specialHours.closeTime,
        lastSeating: specialHours.lastSeating || specialHours.closeTime
      }];
    }
  }
  
  // Get regular opening hours
  const dayOfWeek = date.getDay();
  const openingHours = await prisma.openingHours.findUnique({
    where: {
      restaurantId_dayOfWeek: {
        restaurantId,
        dayOfWeek
      }
    },
    include: {
      periods: true
    }
  });
  
  if (!openingHours?.isOpen) {
    return [];
  }
  
  return openingHours.periods.map(p => ({
    startTime: p.startTime,
    endTime: p.endTime,
    lastSeating: p.lastSeating
  }));
}

/**
 * Helper: Convert time string to minutes since midnight
 */
function timeToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Helper: Convert minutes since midnight to time string
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}