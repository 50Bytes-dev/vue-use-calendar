import { Locale } from 'date-fns';
import { Ref, ComputedRef, ShallowReactive } from 'vue';

interface ICalendarDate {
    readonly date: Date;
    otherMonth: boolean;
    disabled: Ref<boolean>;
    isSelected: Ref<boolean>;
    isBetween: Ref<boolean>;
    isHovered: Ref<boolean>;
    isToday: boolean;
    isWeekend: boolean;
    monthYearIndex: number;
    dayId: string;
    _copied: boolean;
}
declare type CalendarFactory<C extends ICalendarDate> = (...args: any[]) => C;
declare function dateToMonthYear(dateOrYear: Date | number, month?: number): number;
declare function yearFromMonthYear(monthYear: number): number;
declare function monthFromMonthYear(monthYear: number): number;

declare type DateInput = Date | string;
declare type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
declare type WeekdayInputFormat = 'i' | 'io' | 'ii' | 'iii' | 'iiii' | 'iiiii' | 'iiiiii';
interface CalendarComposables<C extends ICalendarDate> {
    useWeekdays: (weekdayFormat?: WeekdayInputFormat) => WeekdaysComposable;
    useMonthlyCalendar: (opts?: MontlyOptions) => MonthlyCalendarComposable<C>;
    useWeeklyCalendar: (opts?: MontlyOptions) => WeeklyCalendarComposable<C>;
}
interface CalendarComposable<C extends ICalendarDate> {
    days: ComputedRef<Array<C>>;
    selectedDates: Array<Date>;
    listeners: Listeners<C>;
}
interface CalendarOptions<C extends ICalendarDate = ICalendarDate> {
    startOn?: DateInput;
    minDate?: DateInput;
    maxDate?: DateInput;
    disabled?: Array<DateInput>;
    firstDayOfWeek?: FirstDayOfWeek;
    locale?: Locale;
    preSelection?: Array<Date> | Date;
    factory?: (date: ICalendarDate) => C;
}
interface NormalizedCalendarOptions<C extends ICalendarDate = ICalendarDate> {
    startOn: Date;
    minDate?: Date;
    maxDate?: Date;
    disabled: Array<Date>;
    firstDayOfWeek: FirstDayOfWeek;
    locale?: Locale;
    preSelection: Array<Date>;
    factory: CalendarFactory<C>;
}
interface Computeds<C extends ICalendarDate> {
    pureDates: ComputedRef<C[]>;
    selectedDates: ComputedRef<C[]>;
    hoveredDates: ComputedRef<C[]>;
    betweenDates: ComputedRef<C[]>;
}
interface Listeners<C extends ICalendarDate> {
    selectSingle: (clickedDate: C) => void;
    selectRange: (clickedDate: C) => void;
    selectMultiple: (clickedDate: C) => void;
    hoverMultiple: (hoveredDate: C) => void;
    resetHover: () => void;
}
interface Selectors<C extends ICalendarDate> extends Listeners<C> {
    selection: Array<Date>;
}
interface MontlyOptions {
    infinite?: boolean;
    fullWeeks?: boolean;
    fixedWeeks?: boolean;
}
interface WrappedDays<C extends ICalendarDate = ICalendarDate> {
    days: Array<C>;
    index: number;
}
interface Month<C extends ICalendarDate = ICalendarDate> extends WrappedDays<C> {
    month: number;
    year: number;
}
interface MonthlyCalendarComposable<C extends ICalendarDate> extends CalendarComposable<C> {
    currentMonthAndYear: ShallowReactive<{
        month: number;
        year: number;
    }>;
    currentMonth: ComputedRef<Month<C>>;
    months: ShallowReactive<Month<C>[]>;
    nextMonth: () => void;
    prevMonth: () => void;
    nextMonthEnabled: ComputedRef<boolean>;
    prevMonthEnabled: ComputedRef<boolean>;
}
interface Week<C extends ICalendarDate = ICalendarDate> extends WrappedDays<C> {
    weekNumber: number;
    month: number;
    year: number;
}
interface WeeklyCalendarComposable<C extends ICalendarDate> extends CalendarComposable<C> {
    weeks: Array<Week<C>>;
    currentWeekIndex: Ref<number>;
    currentWeek: ComputedRef<Week<C>>;
    nextWeek: () => void;
    prevWeek: () => void;
    nextWeekEnabled: ComputedRef<boolean>;
    prevWeekEnabled: ComputedRef<boolean>;
}
interface WeeklyOptions {
    infinite?: boolean;
}
declare type WeekdaysComposable = Array<string>;

declare function useCalendar<C extends ICalendarDate = ICalendarDate>(rawOptions: CalendarOptions<C>): CalendarComposables<C>;

export { CalendarComposables, CalendarOptions, Computeds, FirstDayOfWeek, ICalendarDate, Listeners, Month, MonthlyCalendarComposable, MontlyOptions, NormalizedCalendarOptions, Selectors, Week, WeekdayInputFormat, WeekdaysComposable, WeeklyCalendarComposable, WeeklyOptions, WrappedDays, dateToMonthYear, monthFromMonthYear, useCalendar, yearFromMonthYear };
