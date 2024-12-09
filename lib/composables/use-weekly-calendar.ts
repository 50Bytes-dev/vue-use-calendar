import { computed, ShallowReactive, watchEffect } from "vue";
import { WeeklyOptions, NormalizedCalendarOptions, WeeklyCalendarComposable, Week } from '../types';
import { disableExtendedDates } from "../utils/utils";
import { ICalendarDate } from "../models/CalendarDate";
import { useComputeds, useSelectors } from "./reactiveDates";
import { endOfWeek, startOfWeek } from "date-fns";
import { useNavigation } from "./use-navigation";
import { weekGenerators } from "../utils/utils.week";

const DEFAULT_MONTLY_OPTS: WeeklyOptions = {
  infinite: false,
};

export function weeklyCalendar<C extends ICalendarDate>(globalOptions: NormalizedCalendarOptions<C>) {
  const { generateConsecutiveDays, wrapByWeek, generateWeek } = weekGenerators(globalOptions);

  return function useWeeklyCalendar(opts?: WeeklyOptions): WeeklyCalendarComposable<C> {
    const { infinite } = { ...DEFAULT_MONTLY_OPTS, ...opts };

    const weeklyDays = generateConsecutiveDays(
      startOfWeek(globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }),
      endOfWeek(globalOptions.maxDate || globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }),
    );
    
    disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    
    const daysByWeeks = wrapByWeek(weeklyDays) as ShallowReactive<Week<C>[]>;
    const days = computed(() => daysByWeeks.flatMap(week => week.days));
    const weeks = computed(() => daysByWeeks.toSorted((a, b) => a.index - b.index));

    watchEffect(() => {
      disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    });

    const currentWeekIndex = computed(() => {
      return currentWrapper.value.index;
    });

    const { currentWrapper, jumpTo, nextWrapper, prevWrapper, prevWrapperEnabled, nextWrapperEnabled } = useNavigation(
      daysByWeeks,
      (newWeekIndex) => {
        const year = parseInt(newWeekIndex.toString().slice(0, 4), 10);
        const weekNumber = parseInt(newWeekIndex.toString().slice(4), 10);
        return generateWeek({ year, weekNumber }) as Week<C>;
      },
      infinite);

    const computeds = useComputeds(days);
    const { selection, ...selectors } = useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates);

    return {
      currentWeek: currentWrapper,
      currentWeekIndex,
      days,
      weeks,
      jumpTo: jumpTo,
      nextWeek: nextWrapper,
      prevWeek: prevWrapper,
      prevWeekEnabled: prevWrapperEnabled,
      nextWeekEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners: selectors,
    };
  };
}
