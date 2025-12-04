// src/app/studio/page.tsx
import { sql } from '@/lib/db';
import { config } from '@/lib/config';
import { CalendarDays, Users, TrendingUp, Clock, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDateForAdmin, getRelativeDate } from '@/lib/utils/date';

export const dynamic = 'force-dynamic';

export default async function StudioDashboard() {
  const restaurantId = config.restaurantId;
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [todayBookings, tomorrowBookings, upcomingBookings, stats, recentBookings] = await Promise.all([
    sql`
      SELECT 
        b.*,
        t.table_number
      FROM bookings b
      LEFT JOIN tables t ON b.table_id = t.id
      WHERE b.restaurant_id = ${restaurantId}
      AND b.booking_date = ${today}
      AND b.status = 'confirmed'
      ORDER BY b.booking_time ASC
    `,
    sql`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE restaurant_id = ${restaurantId}
      AND booking_date = ${tomorrow}
      AND status = 'confirmed'
    `,
    sql`
      SELECT COUNT(*) as count
      FROM bookings
      WHERE restaurant_id = ${restaurantId}
      AND booking_date > ${today}
      AND status = 'confirmed'
    `,
    sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
        SUM(party_size) FILTER (WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days' AND status = 'completed') as total_guests
      FROM bookings
      WHERE restaurant_id = ${restaurantId}
      AND booking_date >= CURRENT_DATE - INTERVAL '30 days'
    `,
    sql`
      SELECT 
        b.*,
        t.table_number
      FROM bookings b
      LEFT JOIN tables t ON b.table_id = t.id
      WHERE b.restaurant_id = ${restaurantId}
      ORDER BY b.created_at DESC
      LIMIT 5
    `
  ]);

  const totalGuests30d = Number(stats[0].total_guests) || 0;
  const averagePartySize = stats[0].completed > 0 ? (totalGuests30d / Number(stats[0].completed)).toFixed(1) : '0';

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-black tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Välkommen tillbaka! Här är en översikt över dina bokningar.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Idag"
          value={todayBookings.length}
          description="aktiva bokningar"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatsCard
          title="Imorgon"
          value={Number(tomorrowBookings[0].count)}
          description="bekräftade"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatsCard
          title="Kommande"
          value={Number(upcomingBookings[0].count)}
          description="framtida bokningar"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatsCard
          title="Gäster (30d)"
          value={totalGuests30d}
          description={`Ø ${averagePartySize} per bokning`}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Dagens bokningar</CardTitle>
            <CardDescription>
              {todayBookings.length} {todayBookings.length === 1 ? 'bokning' : 'bokningar'} idag
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">Inga bokningar idag</p>
                <p className="text-sm text-muted-foreground mt-1">Du kan koppla av lite! 😊</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todayBookings.map((booking: any, index: number) => (
                  <div key={booking.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="text-xl font-bold bg-primary text-primary-foreground px-4 py-3 rounded-lg">
                          {booking.booking_time.slice(0, 5)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-lg truncate">{booking.customer_name}</p>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {booking.party_size} {booking.party_size === 1 ? 'person' : 'personer'}
                              </span>
                              {booking.table_number && (
                                <>
                                  <span>•</span>
                                  <span>Bord {booking.table_number}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                          <a href={`tel:${booking.customer_phone}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                            <Phone className="h-3 w-3" />
                            {booking.customer_phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Senaste bokningarna</CardTitle>
            <CardDescription>De 5 senast skapade bokningarna</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking: any, index: number) => {
                // Parse the date properly from the database
                const bookingDate = new Date(booking.booking_date);
                const dateStr = bookingDate.toISOString().split('T')[0];
                
                return (
                  <div key={booking.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{booking.customer_name}</p>
                        <div className="mt-1 space-y-0.5">
                          <p className="text-sm text-muted-foreground">
                            {getRelativeDate(dateStr)} kl {booking.booking_time.slice(0, 5)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.party_size} {booking.party_size === 1 ? 'person' : 'personer'}
                            {booking.table_number && ` • Bord ${booking.table_number}`}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    confirmed: "default",
    completed: "secondary",
    cancelled: "destructive",
    no_show: "outline",
  };

  const labels = {
    confirmed: 'Bekräftad',
    completed: 'Genomförd',
    cancelled: 'Avbokad',
    no_show: 'Uteblev',
  };

  return (
    <Badge variant={variants[status]} className="shrink-0">
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}