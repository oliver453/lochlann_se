export interface Availability {
    date: string;
    hasNormalStock: boolean;
    timeslots: Timeslot[];
  }
  
  export interface Timeslot {
    time: number; // minutes since midnight
    timeString: string;
    availableTables: number;
  }
  
  /**
   * Fetch availability for a date range
   */
  export async function fetchAvailabilities(
    restaurantId: string,
    partySize: number,
    startDate: string,
    endDate: string
  ): Promise<Availability[]> {
    try {
      const params = new URLSearchParams({
        restaurantId,
        partySize: partySize.toString(),
        startDate,
        endDate,
      });
  
      const response = await fetch(`/api/bookings/availability?${params}`);
  
      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching availabilities:', error);
      throw error;
    }
  }
  
  /**
   * Fetch timeslots for a specific date
   */
  export async function fetchTimeslots(
    restaurantId: string,
    date: string,
    partySize: number
  ): Promise<Timeslot[]> {
    try {
      const params = new URLSearchParams({
        restaurantId,
        partySize: partySize.toString(),
        startDate: date,
        endDate: date,
      });
  
      const response = await fetch(`/api/bookings/availability?${params}`);
  
      if (!response.ok) {
        throw new Error('Failed to fetch timeslots');
      }
  
      const data: Availability[] = await response.json();
      
      // Return timeslots for the requested date
      const dayData = data.find(d => d.date === date);
      return dayData?.timeslots || [];
    } catch (error) {
      console.error('Error fetching timeslots:', error);
      throw error;
    }
  }