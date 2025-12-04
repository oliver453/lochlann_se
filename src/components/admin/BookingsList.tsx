// src/components/admin/BookingsList.tsx
"use client";

import { useState, useMemo } from 'react';
import { Search, Download, Eye, Mail, Phone, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDateForAdmin } from '@/lib/utils/date';

export function BookingsList({ 
  initialBookings,
}: { 
  initialBookings: any[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Date filter - only apply if a date is selected
      const matchesDate = !selectedDate || new Date(b.booking_date).toISOString().split('T')[0] === selectedDate;
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      
      // Search filter
      const matchesSearch = !searchTerm || 
        b.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.customer_phone.includes(searchTerm);
      
      // Time filter
      let matchesTime = true;
      if (timeFilter !== 'all' && b.booking_time) {
        const hour = parseInt(b.booking_time.split(':')[0]);
        if (timeFilter === 'lunch') matchesTime = hour >= 11 && hour < 15;
        if (timeFilter === 'dinner') matchesTime = hour >= 17 && hour < 23;
      }

      return matchesDate && matchesStatus && matchesSearch && matchesTime;
    });
  }, [bookings, selectedDate, statusFilter, searchTerm, timeFilter]);

  const updateBookingStatus = async (id: string, status: string) => {
    const response = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      setBookings(prev => prev.map(b => 
        b.id === id ? { ...b, status } : b
      ));
    }
  };

  const exportToCSV = () => {
    const headers = ['Datum', 'Tid', 'Namn', 'Email', 'Telefon', 'Antal personer', 'Bord', 'Status'];
    const rows = filteredBookings.map(b => [
      new Date(b.booking_date).toISOString().split('T')[0],
      b.booking_time.slice(0, 5),
      b.customer_name,
      b.customer_email,
      b.customer_phone,
      b.party_size,
      b.table_number || '-',
      b.status
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bokningar-${selectedDate || 'alla'}.csv`;
    a.click();
  };

  const getStatusCounts = () => {
    const counts = {
      all: filteredBookings.length,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0
    };

    filteredBookings.forEach(b => {
      if (b.status in counts) {
        counts[b.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatsCard label="Totalt" value={statusCounts.all} />
        <StatsCard label="Bekräftade" value={statusCounts.confirmed} />
        <StatsCard label="Genomförda" value={statusCounts.completed} />
        <StatsCard label="Avbokade" value={statusCounts.cancelled} />
        <StatsCard label="Uteblev" value={statusCounts.no_show} />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Sök och filtrera</CardTitle>
          </div>
          <CardDescription>Hitta bokningar snabbt med filter och sökning</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök på namn, email eller telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Datum (valfritt)</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                placeholder="Alla datum"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla</SelectItem>
                  <SelectItem value="confirmed">Bekräftad</SelectItem>
                  <SelectItem value="completed">Genomförd</SelectItem>
                  <SelectItem value="cancelled">Avbokad</SelectItem>
                  <SelectItem value="no_show">Uteblev</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tidsperiod</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alla tider</SelectItem>
                  <SelectItem value="lunch">Lunch (11-15)</SelectItem>
                  <SelectItem value="dinner">Middag (17-23)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={exportToCSV} variant="outline" className="w-full">
                <Download className="h-4 w-4" />
                Exportera CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum & Tid</TableHead>
              <TableHead>Kund</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Antal</TableHead>
              <TableHead>Bord</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Åtgärder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">Inga bokningar hittades</p>
                    <p className="text-sm">Prova att ändra dina filter</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => {
                const bookingDate = new Date(booking.booking_date);
                const dateStr = bookingDate.toISOString().split('T')[0];
                
                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-semibold">{booking.booking_time.slice(0, 5)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateForAdmin(dateStr)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {booking.customer_name}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <a href={`mailto:${booking.customer_email}`} className="text-xs flex items-center gap-1 hover:underline">
                          <Mail className="h-3 w-3" />
                          {booking.customer_email}
                        </a>
                        <a href={`tel:${booking.customer_phone}`} className="text-xs flex items-center gap-1 hover:underline">
                          <Phone className="h-3 w-3" />
                          {booking.customer_phone}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>{booking.party_size} pers</TableCell>
                    <TableCell>
                      {booking.table_number ? `Bord ${booking.table_number}` : '-'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={booking.status}
                          onValueChange={(status) => updateBookingStatus(booking.id, status)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmed">Bekräftad</SelectItem>
                            <SelectItem value="completed">Genomförd</SelectItem>
                            <SelectItem value="no_show">Uteblev</SelectItem>
                            <SelectItem value="cancelled">Avbokad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <p className="font-medium">Inga bokningar hittades</p>
              <p className="text-sm mt-1">Prova att ändra dina filter</p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => {
            const bookingDate = new Date(booking.booking_date);
            const dateStr = bookingDate.toISOString().split('T')[0];
            
            return (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {booking.booking_time.slice(0, 5)}
                      </CardTitle>
                      <CardDescription>
                        {formatDateForAdmin(dateStr)}
                      </CardDescription>
                    </div>
                    <StatusBadge status={booking.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold">{booking.customer_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.party_size} personer
                      {booking.table_number && ` • Bord ${booking.table_number}`}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <a href={`mailto:${booking.customer_email}`} className="text-sm flex items-center gap-2 hover:underline">
                      <Mail className="h-4 w-4" />
                      {booking.customer_email}
                    </a>
                    <a href={`tel:${booking.customer_phone}`} className="text-sm flex items-center gap-2 hover:underline">
                      <Phone className="h-4 w-4" />
                      {booking.customer_phone}
                    </a>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetails(true);
                      }}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Detaljer
                    </Button>
                    <Select
                      value={booking.status}
                      onValueChange={(status) => updateBookingStatus(booking.id, status)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Bekräftad</SelectItem>
                        <SelectItem value="completed">Genomförd</SelectItem>
                        <SelectItem value="no_show">Uteblev</SelectItem>
                        <SelectItem value="cancelled">Avbokad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Bokningsdetaljer</DialogTitle>
              <DialogDescription>
                Boknings-ID: {selectedBooking.id.slice(0, 8).toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold mb-3">Bokningstid</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Datum</Label>
                    <p className="font-medium mt-1">
                      {formatDateForAdmin(new Date(selectedBooking.booking_date).toISOString().split('T')[0])}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Tid</Label>
                    <p className="font-medium mt-1">{selectedBooking.booking_time.slice(0, 5)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Antal personer</Label>
                    <p className="font-medium mt-1">{selectedBooking.party_size}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Bord</Label>
                    <p className="font-medium mt-1">{selectedBooking.table_number || 'Ej tilldelat'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-semibold mb-3">Kundinformation</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground text-xs">Namn</Label>
                    <p className="font-medium mt-1">{selectedBooking.customer_name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Email</Label>
                    <a href={`mailto:${selectedBooking.customer_email}`} className="hover:underline block mt-1">
                      {selectedBooking.customer_email}
                    </a>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Telefon</Label>
                    <a href={`tel:${selectedBooking.customer_phone}`} className="hover:underline block mt-1">
                      {selectedBooking.customer_phone}
                    </a>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground text-xs">Anteckningar</Label>
                    <p className="text-sm mt-2 bg-muted p-3 rounded-lg">{selectedBooking.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <Label className="text-muted-foreground text-xs mb-2 block">Ändra status</Label>
                <Select
                  value={selectedBooking.status}
                  onValueChange={(status) => {
                    updateBookingStatus(selectedBooking.id, status);
                    setSelectedBooking({ ...selectedBooking, status });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Bekräftad</SelectItem>
                    <SelectItem value="completed">Genomförd</SelectItem>
                    <SelectItem value="no_show">Uteblev</SelectItem>
                    <SelectItem value="cancelled">Avbokad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function StatsCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription className="text-xs font-medium">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
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
    <Badge variant={variants[status]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}