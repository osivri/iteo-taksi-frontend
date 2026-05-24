'use client';

import { useMemo, useState } from 'react';
import {
  formatMonthLabel,
  getCalendarDays,
  isBeforeDay,
  isInRange,
  isSameDay,
  startOfDay,
  toDateKey,
  weekdayLabels,
} from '@/lib/date-utils';

interface BaseProps {
  minDate?: Date;
  className?: string;
}

interface SingleProps extends BaseProps {
  mode: 'single';
  value: string | null;
  onChange: (dateKey: string) => void;
}

interface RangeProps extends BaseProps {
  mode: 'range';
  checkIn: string | null;
  checkOut: string | null;
  onChange: (checkIn: string, checkOut: string | null) => void;
}

type Props = SingleProps | RangeProps;

export function BookingCalendar(props: Props) {
  const today = startOfDay(new Date());
  const minDate = props.minDate ?? today;
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const days = useMemo(() => getCalendarDays(viewMonth), [viewMonth]);
  const weekDays = weekdayLabels();

  function isDisabled(date: Date): boolean {
    return isBeforeDay(date, minDate);
  }

  function handleDayClick(date: Date) {
    if (isDisabled(date)) return;
    const key = toDateKey(date);

    if (props.mode === 'single') {
      props.onChange(key);
      return;
    }

    const { checkIn, checkOut, onChange } = props;
    if (!checkIn || (checkIn && checkOut)) {
      onChange(key, null);
      return;
    }

    const checkInDate = startOfDay(new Date(`${checkIn}T12:00:00`));
    if (isBeforeDay(date, checkInDate)) {
      onChange(key, null);
      return;
    }

    if (isSameDay(date, checkInDate)) {
      onChange(key, key);
      return;
    }

    onChange(checkIn, key);
  }

  function dayClass(date: Date): string {
    const base =
      'flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-colors';
    const inMonth = date.getMonth() === viewMonth.getMonth();
    const disabled = isDisabled(date);

    if (props.mode === 'single') {
      const selected = props.value === toDateKey(date);
      if (disabled) return `${base} cursor-not-allowed text-iteo-gray-300`;
      if (selected) return `${base} bg-iteo-yellow text-iteo-black shadow-sm`;
      return `${base} ${inMonth ? 'text-iteo-black hover:bg-iteo-yellow/20' : 'text-iteo-gray-300 hover:bg-iteo-gray-100'}`;
    }

    const checkIn = props.checkIn ? startOfDay(new Date(`${props.checkIn}T12:00:00`)) : null;
    const checkOut = props.checkOut ? startOfDay(new Date(`${props.checkOut}T12:00:00`)) : null;
    const isStart = checkIn && isSameDay(date, checkIn);
    const isEnd = checkOut && isSameDay(date, checkOut);
    const inRange = isInRange(date, checkIn, checkOut);

    if (disabled) return `${base} cursor-not-allowed text-iteo-gray-300`;
    if (isStart || isEnd) return `${base} bg-iteo-yellow text-iteo-black shadow-sm`;
    if (inRange) return `${base} bg-iteo-yellow/25 text-iteo-black`;
    return `${base} ${inMonth ? 'text-iteo-black hover:bg-iteo-yellow/20' : 'text-iteo-gray-300 hover:bg-iteo-gray-100'}`;
  }

  function prevMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  return (
    <div className={`rounded-xl border border-iteo-gray-200 bg-white p-4 ${props.className ?? ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg px-3 py-1.5 text-sm text-iteo-gray-600 hover:bg-iteo-gray-100"
          aria-label="Önceki ay">
          ←
        </button>
        <p className="font-semibold text-iteo-black">{formatMonthLabel(viewMonth)}</p>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg px-3 py-1.5 text-sm text-iteo-gray-600 hover:bg-iteo-gray-100"
          aria-label="Sonraki ay">
          →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="py-1 text-center text-xs font-semibold text-iteo-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => (
          <button
            key={toDateKey(date)}
            type="button"
            disabled={isDisabled(date)}
            onClick={() => handleDayClick(date)}
            className={dayClass(date)}>
            {date.getDate()}
          </button>
        ))}
      </div>

      {props.mode === 'range' && (
        <p className="mt-4 text-xs text-iteo-gray-500">
          Giriş tarihini seçin, ardından çıkış tarihini seçin.
        </p>
      )}
    </div>
  );
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = startOfDay(new Date(`${checkIn}T12:00:00`));
  const end = startOfDay(new Date(`${checkOut}T12:00:00`));
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
}
