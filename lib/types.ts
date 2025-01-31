import { Locale } from "date-fns";
import { ComputedRef, ShallowReactive } from "vue";
import { CalendarFactory, ICalendarDate } from "./models/CalendarDate";

type DateInput = Date | string;
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';

// Calendar

export interface CalendarComposables<C extends ICalendarDate> {
  useWeekdays: (weekdayFormat?: WeekdayInputFormat) => WeekdaysComposable;
  useMonthlyCalendar: (opts?: MontlyOptions) => MonthlyCalendarComposable<C>;
  useWeeklyCalendar: (opts?: MontlyOptions) => WeeklyCalendarComposable<C>;
  factory: CalendarFactory<C>;
}

interface CalendarComposable<C extends ICalendarDate> {
  days: ComputedRef<Array<C>>;
  selectedDates: Array<Date>;
  listeners: Listeners<C>;
}

export interface CalendarOptions<C extends ICalendarDate = ICalendarDate> {
  startOn?: DateInput;
  minDate?: DateInput;
  maxDate?: DateInput;
  disabled?: Array<DateInput> | ((date: Date) => boolean);
  firstDayOfWeek?: FirstDayOfWeek;
  locale?: Locale;
  preSelection?: Array<Date> | Date;
  factory?: (date: ICalendarDate) => C;
}

export interface NormalizedCalendarOptions<C extends ICalendarDate = ICalendarDate> {
  startOn: Date;
  minDate?: Date;
  maxDate?: Date;
  disabled: Array<Date> | ((date: Date) => boolean);
  firstDayOfWeek: FirstDayOfWeek;
  locale?: Locale;
  preSelection: Array<Date>;
  factory: CalendarFactory<C>;
}

export interface Computeds<C extends ICalendarDate> {
  pureDates: ComputedRef<C[]>;
  selectedDates: ComputedRef<C[]>;
  hoveredDates: ComputedRef<C[]>;
  betweenDates: ComputedRef<C[]>;
}

export interface SelectOptions {
  strict?: boolean;
  multiple?: boolean;
}

export type SelectRangeOptions = Pick<SelectOptions, 'strict' | 'multiple'>;
export type HoverMultipleOptions = Pick<SelectOptions, 'strict'>;

export interface Listeners<C extends ICalendarDate> {
  selectSingle: (clickedDate: C) => void;
  selectRange: (clickedDate: C, options?: SelectRangeOptions) => void;
  selectMultiple: (clickedDate: C) => void;
  hoverMultiple: (hoveredDate: C, options?: HoverMultipleOptions) => void;
  resetHover: () => void;
  resetSelection: () => void;
}

export interface Selectors<C extends ICalendarDate> extends Listeners<C> {
  selection: Array<Date>;
}

// Month

export interface MontlyOptions {
  infinite?: boolean;
  fullWeeks?: boolean;
  fixedWeeks?: boolean;
}

export interface WrappedDays<C extends ICalendarDate = ICalendarDate> {
  days: Array<C>;
  index: number;
}

export interface Month<C extends ICalendarDate = ICalendarDate> extends WrappedDays<C> {
  month: number;
  year: number;
}

export interface MonthlyCalendarComposable<C extends ICalendarDate> extends CalendarComposable<C> {
  currentMonthAndYear: ShallowReactive<{ month: number; year: number }>;
  currentMonth: ComputedRef<Month<C>>;
  currentMonthYearIndex: ComputedRef<number>;
  months: ComputedRef<Month<C>[]>;
  jumpTo: (i: number) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  nextMonthEnabled: ComputedRef<boolean>;
  prevMonthEnabled: ComputedRef<boolean>;
}

// Week

export interface Week<C extends ICalendarDate = ICalendarDate> extends WrappedDays<C> {
  weekNumber: number;
  month: number;
  year: number;
}

export interface WeeklyCalendarComposable<C extends ICalendarDate> extends CalendarComposable<C> {
  weeks: ComputedRef<Array<Week<C>>>;
  currentWeekIndex: ComputedRef<number>;
  currentWeek: ComputedRef<Week<C>>;
  jumpTo: (i: number) => void;
  nextWeek: () => void;
  prevWeek: () => void;
  nextWeekEnabled: ComputedRef<boolean>;
  prevWeekEnabled: ComputedRef<boolean>;
}

export interface WeeklyOptions {
  infinite?: boolean;
}

export type WeekdaysComposable = Array<string>;
