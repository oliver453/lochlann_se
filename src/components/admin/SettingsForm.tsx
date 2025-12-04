// src/components/admin/SettingsForm.tsx
"use client";

import { useState } from 'react';
import { Save, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface BookingSettings {
  slot_duration: number;
  booking_window_days: number;
  min_advance_hours: number;
  max_party_size: number;
  default_booking_duration: number;
}

interface OpeningHours {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export function SettingsForm({ 
  restaurantId,
  initialSettings,
  initialOpeningHours 
}: {
  restaurantId: string;
  initialSettings: any;
  initialOpeningHours: any[];
}) {
  const [settings, setSettings] = useState<BookingSettings>(
    initialSettings || {
      slot_duration: 30,
      booking_window_days: 60,
      min_advance_hours: 2,
      max_party_size: 12,
      default_booking_duration: 120,
    }
  );
  
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(initialOpeningHours);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const weekdays = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch(`/api/admin/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          settings,
          openingHours,
        }),
      });

      if (response.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Kunde inte spara inställningar');
    } finally {
      setIsSaving(false);
    }
  };

  const updateOpeningHours = (dayOfWeek: number, field: string, value: any) => {
    setOpeningHours(prev => {
      const existing = prev.find(h => h.day_of_week === dayOfWeek);
      
      if (existing) {
        return prev.map(h => 
          h.day_of_week === dayOfWeek 
            ? { ...h, [field]: value }
            : h
        );
      } else {
        return [...prev, {
          id: `temp-${dayOfWeek}`,
          day_of_week: dayOfWeek,
          open_time: '17:00:00',
          close_time: '23:00:00',
          is_closed: false,
          [field]: value,
        }];
      }
    });
  };

  const getHoursForDay = (dayOfWeek: number) => {
    return openingHours.find(h => h.day_of_week === dayOfWeek) || {
      day_of_week: dayOfWeek,
      open_time: '17:00:00',
      close_time: '23:00:00',
      is_closed: false,
    };
  };

  const copyToAllDays = (sourceDay: number) => {
    const sourceHours = getHoursForDay(sourceDay);
    weekdays.forEach((_, index) => {
      if (index !== sourceDay) {
        updateOpeningHours(index, 'open_time', sourceHours.open_time);
        updateOpeningHours(index, 'close_time', sourceHours.close_time);
        updateOpeningHours(index, 'is_closed', sourceHours.is_closed);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Bokningsinställningar */}
      <Card>
        <CardHeader>
          <CardTitle>Bokningsinställningar</CardTitle>
          <CardDescription>Hantera hur ditt bokningssystem fungerar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingField
              label="Tidsluckor (minuter)"
              description="Tidsintervall mellan bokningsbara tider"
              value={settings.slot_duration}
              onChange={(val) => setSettings({ ...settings, slot_duration: val })}
              min={15}
              step={15}
              suggestions={[15, 30, 60]}
            />

            <SettingField
              label="Max antal personer"
              description="Maximal gruppstorlek för bokningar"
              value={settings.max_party_size}
              onChange={(val) => setSettings({ ...settings, max_party_size: val })}
              min={1}
              max={50}
              suggestions={[8, 12, 16, 20]}
            />

            <SettingField
              label="Bokningsfönster (dagar)"
              description="Hur långt fram kunder kan boka"
              value={settings.booking_window_days}
              onChange={(val) => setSettings({ ...settings, booking_window_days: val })}
              min={1}
              max={365}
              suggestions={[30, 60, 90]}
            />

            <SettingField
              label="Min framförhållning (timmar)"
              description="Minsta tid i förväg som krävs för bokning"
              value={settings.min_advance_hours}
              onChange={(val) => setSettings({ ...settings, min_advance_hours: val })}
              min={0}
              max={72}
              suggestions={[1, 2, 4, 24]}
            />

            <SettingField
              label="Standard bokningstid (minuter)"
              description="Hur länge ett bord är reserverat"
              value={settings.default_booking_duration}
              onChange={(val) => setSettings({ ...settings, default_booking_duration: val })}
              min={30}
              step={30}
              suggestions={[90, 120, 150]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Öppettider */}
      <Card>
        <CardHeader>
          <CardTitle>Öppettider</CardTitle>
          <CardDescription>Ställ in när restaurangen har öppet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weekdays.map((day, index) => {
            const hours = getHoursForDay(index);
            return (
              <div key={index}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-full sm:w-28 font-medium">{day}</div>
                  
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <Input
                      type="time"
                      value={hours.open_time?.slice(0, 5) || '17:00'}
                      onChange={(e) => updateOpeningHours(index, 'open_time', e.target.value + ':00')}
                      disabled={hours.is_closed}
                      className="w-32"
                    />
                    
                    <span className="text-muted-foreground">-</span>
                    
                    <Input
                      type="time"
                      value={hours.close_time?.slice(0, 5) || '23:00'}
                      onChange={(e) => updateOpeningHours(index, 'close_time', e.target.value + ':00')}
                      disabled={hours.is_closed}
                      className="w-32"
                    />
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={hours.is_closed || false}
                        onCheckedChange={(checked) => updateOpeningHours(index, 'is_closed', checked)}
                      />
                      <Label className="cursor-pointer">Stängt</Label>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToAllDays(index)}
                    >
                      Kopiera till alla
                    </Button>
                  </div>
                </div>
                {index < weekdays.length - 1 && <Separator className="mt-4" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 border-t -mx-4 md:mx-0 md:border-0 md:p-0">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          size="lg"
          className="w-full"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
              Sparar...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Sparat!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Spara alla inställningar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SettingField({
  label,
  description,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suggestions = [],
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suggestions?: number[];
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="font-semibold">{label}</Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || min)}
        min={min}
        max={max}
        step={step}
        className="font-medium"
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion}
              variant={value === suggestion ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}