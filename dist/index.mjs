// lib/composables/use-weekdays.ts
import { addDays, format, nextSunday } from "date-fns";
function useWeekdays({ firstDayOfWeek, locale }) {
  return (weekdayFormat = "iiiii") => {
    const sunday = nextSunday(new Date());
    const weekdays = Array.from(Array(7).keys()).map((i) => addDays(sunday, i));
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift());
    });
    return weekdays.map((day) => format(day, weekdayFormat, { locale }));
  };
}

// lib/composables/use-monthly-calendar.ts
import { computed as computed3, reactive as reactive2, watch as watch2, watchEffect } from "vue";
import { startOfMonth as startOfMonth2, endOfMonth as endOfMonth2 } from "date-fns";

// lib/utils/utils.ts
import { isAfter, isBefore, isSameDay } from "date-fns";
function generators(globalOptions) {
  function generateConsecutiveDays(from, to) {
    var _a;
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const dates = [globalOptions.factory(from)];
    let dayIndex = from.getDate() + 1;
    if (isAfter(from, to)) {
    }
    while (isBefore(((_a = dates[dates.length - 1]) == null ? void 0 : _a.date) || 0, to)) {
      const date = globalOptions.factory(from.getFullYear(), from.getMonth(), dayIndex++);
      date.disabled.value = globalOptions.disabled.some((disabled) => isSameDay(date.date, disabled));
      dates.push(date);
    }
    return dates;
  }
  return {
    generateConsecutiveDays
  };
}
function getBetweenDays(pureDates, first, second) {
  const firstSelectedDayIndex = pureDates.findIndex((day) => isSameDay(day.date, first.date));
  const secondSelectedDayIndex = pureDates.findIndex((day) => isSameDay(day.date, second.date));
  const [lowestDate, greatestDate] = [firstSelectedDayIndex, secondSelectedDayIndex].sort((a, b) => a - b);
  return pureDates.slice(lowestDate + 1, greatestDate);
}
function disableExtendedDates(dates, from, to) {
  const beforeFromDates = from ? dates.slice(0, dates.findIndex((day) => isSameDay(day.date, from))) : [];
  const afterToDates = to ? dates.slice(dates.findIndex((day) => isSameDay(day.date, to))) : [];
  [...beforeFromDates, ...afterToDates].forEach((day) => {
    day.disabled.value = true;
  });
}
function chunk(arr, size = 7) {
  return Array(Math.ceil(arr.length / size)).fill(null).map((_, i) => {
    return arr.slice(i * size, i * size + size);
  });
}

// lib/models/CalendarDate.ts
import { isToday } from "date-fns";
import { ref } from "vue";
function generateCalendarFactory(customFactory) {
  const extendFactory = customFactory || ((c) => c);
  return function(...args) {
    const date = new Date(...args);
    const weekDay = date.getDay();
    return extendFactory({
      date,
      isToday: isToday(date),
      isWeekend: weekDay === 0 || weekDay > 6,
      otherMonth: false,
      disabled: ref(false),
      selectionType: ref(null),
      rangeSibling: ref(null),
      isSelected: ref(false),
      isBetween: ref(false),
      isHovered: ref(false),
      monthYearIndex: dateToMonthYear(date),
      dayId: [date.getFullYear(), date.getMonth(), date.getDate()].join("-"),
      _copied: false
    });
  };
}
function copyCalendarDate(date) {
  return { ...date, _copied: true };
}
function dateToMonthYear(dateOrYear, month) {
  if (typeof dateOrYear === "number") {
    return dateOrYear * 12 + (month || 0);
  } else {
    return dateOrYear.getFullYear() * 12 + dateOrYear.getMonth();
  }
}
function yearFromMonthYear(monthYear) {
  return Math.floor(monthYear / 12);
}
function monthFromMonthYear(monthYear) {
  return monthYear % 12;
}

// lib/composables/reactiveDates.ts
import { computed, reactive, watch } from "vue";
import { isSameDay as isSameDay2 } from "date-fns";
function useComputeds(days) {
  const pureDates = computed(() => {
    return days.value.filter((day) => !day._copied);
  });
  const selectedDates = computed(() => {
    return pureDates.value.filter((day) => day.isSelected.value);
  });
  const hoveredDates = computed(() => {
    return pureDates.value.filter((day) => day.isHovered.value);
  });
  const betweenDates = computed(() => {
    return pureDates.value.filter((day) => day.isBetween.value);
  });
  return {
    pureDates,
    selectedDates,
    hoveredDates,
    betweenDates
  };
}
function useSelectors(days, selectedDates, betweenDates, hoveredDates) {
  const selection = reactive([]);
  const selectionRanges = reactive([]);
  watch(selection, () => {
    days.value.forEach((day) => {
      day.isSelected.value = selection.some((selected) => isSameDay2(selected, day.date));
    });
    betweenDates.value.forEach((betweenDate) => {
      betweenDate.isBetween.value = false;
    });
    const selectedDateRanges = [];
    for (let i = 0; i < selectionRanges.length; i++) {
      const found = selectedDates.value.find((day) => isSameDay2(day.date, selectionRanges[i]));
      if (found) {
        selectedDateRanges.push(found);
      }
    }
    for (let i = 0; i < selectedDateRanges.length - 1; i += 2) {
      const firstDate = selectedDateRanges[i];
      const secondDate = selectedDateRanges[i + 1];
      if (!firstDate || !secondDate) {
        continue;
      }
      const daysBetween = getBetweenDays(days.value, firstDate, secondDate);
      daysBetween.forEach((day) => {
        day.isBetween.value = true;
      });
    }
  });
  function updateSelection(calendarDate, type) {
    const selectedDateIndex = selection.findIndex((date) => isSameDay2(calendarDate.date, date));
    if (selectedDateIndex >= 0) {
      calendarDate.selectionType.value = null;
      selection.splice(selectedDateIndex, 1);
    } else {
      calendarDate.selectionType.value = type;
      selection.push(calendarDate.date);
    }
  }
  function selectSingle(clickedDate) {
    const selectedDate = days.value.find((day) => isSameDay2(day.date, selection[0]));
    if (selectedDate) {
      updateSelection(selectedDate, "single" /* Single */);
    }
    updateSelection(clickedDate, "single" /* Single */);
  }
  function selectRange(clickedDate, options = {}) {
    const { strict = false, multiple = false } = options;
    let isValid = true;
    if (strict) {
      const selectedDateRanges = [];
      for (let i = 0; i < selectionRanges.length; i++) {
        const found = selectedDates.value.find((day) => isSameDay2(day.date, selectionRanges[i]));
        if (found) {
          selectedDateRanges.push(found);
        }
      }
      for (let i = 0; i < selectedDateRanges.length; i += 2) {
        const firstDate = selectedDateRanges[i];
        const secondDate = selectedDateRanges[i + 1] || clickedDate;
        if (!firstDate || !secondDate) {
          continue;
        }
        if (!(isSameDay2(firstDate.date, clickedDate.date) || isSameDay2(secondDate.date, clickedDate.date))) {
          continue;
        }
        const daysBetween = getBetweenDays(days.value, firstDate, secondDate);
        if (daysBetween.some((day) => day.disabled.value || day.isBetween.value)) {
          isValid = false;
        }
      }
    }
    if (!multiple && selection.length >= 2 && !clickedDate.isSelected.value) {
      selection.splice(0);
      selectionRanges.splice(0);
    }
    if (!isValid) {
      selection.splice(-1);
      selectionRanges.splice(-1);
    }
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate, "range" /* Range */);
    selectionRanges.push(clickedDate.date);
  }
  function selectMultiple(clickedDate) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate, "multiple" /* Multiple */);
  }
  function hoverMultiple(hoveredDate, options = {}) {
    const { strict = false } = options;
    if (selectedDates.value.length % 2 === 0) {
      return;
    }
    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
    const lastSelectedDate = selection[selection.length - 1];
    const lastSelectedCalendarDate = days.value.find((day) => isSameDay2(day.date, lastSelectedDate));
    if (!lastSelectedCalendarDate) {
      return;
    }
    const datesToHover = [
      hoveredDate,
      lastSelectedCalendarDate,
      ...getBetweenDays(days.value, lastSelectedCalendarDate, hoveredDate)
    ];
    if (strict && datesToHover.some((day) => (day.disabled.value || day.isSelected.value || day.isBetween.value) && !isSameDay2(day.date, lastSelectedDate))) {
      return;
    }
    datesToHover.forEach((day) => {
      day.isHovered.value = true;
    });
    hoveredDate.isHovered.value = true;
  }
  function resetHover() {
    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
  }
  function resetSelection() {
    selection.splice(0);
    selectionRanges.splice(0);
    selectedDates.value.forEach((day) => {
      day.isSelected.value = false;
    });
    betweenDates.value.forEach((day) => {
      day.isBetween.value = false;
    });
  }
  return {
    selection,
    selectSingle,
    selectRange,
    selectMultiple,
    hoverMultiple,
    resetHover,
    resetSelection
  };
}

// lib/composables/use-navigation.ts
import { computed as computed2, ref as ref2 } from "vue";
function useNavigation(daysWrapper, generateWrapper, infinite = false) {
  const currentWrapperIndex = ref2(0);
  const currentWrapper = computed2(() => daysWrapper[currentWrapperIndex.value]);
  const prevWrapperEnabled = computed2(() => infinite || currentWrapperIndex.value > 0);
  const nextWrapperEnabled = computed2(() => infinite || currentWrapperIndex.value < daysWrapper.length - 1);
  function nextWrapper() {
    jumpTo(currentWrapper.value.index + 1);
  }
  function prevWrapper() {
    jumpTo(currentWrapper.value.index - 1);
  }
  function jumpTo(newWrapperIndex) {
    if (newWrapperIndex === currentWrapper.value.index) {
      return;
    }
    let newIndex = daysWrapper.findIndex((wrap) => wrap.index === newWrapperIndex);
    if (infinite && newIndex < 0) {
      const newWrapper = generateWrapper(newWrapperIndex, currentWrapper);
      if (newWrapperIndex === daysWrapper[0].index - 1) {
        daysWrapper.unshift(newWrapper);
        newIndex = 0;
      } else if (newWrapperIndex === daysWrapper[daysWrapper.length - 1].index + 1) {
        daysWrapper.push(newWrapper);
        newIndex = daysWrapper.length - 1;
      } else {
        daysWrapper.splice(0, daysWrapper.length, newWrapper);
        newIndex = 0;
      }
    }
    currentWrapperIndex.value = -1;
    currentWrapperIndex.value = Math.max(0, newIndex);
  }
  return {
    jumpTo,
    nextWrapper,
    prevWrapper,
    prevWrapperEnabled,
    nextWrapperEnabled,
    currentWrapper
  };
}

// lib/utils/utils.month.ts
import { shallowReactive } from "vue";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
function monthGenerators(globalOptions) {
  const { generateConsecutiveDays } = generators(globalOptions);
  function monthFactory(monthDays) {
    return {
      days: monthDays,
      month: monthDays[10].date.getMonth(),
      year: monthDays[10].date.getFullYear(),
      index: monthDays[10].monthYearIndex
    };
  }
  function wrapByMonth(days, otherMonthsDays = false, fixedWeeks = false) {
    const allMonthYearsIndex = [...new Set(days.map((day) => day.monthYearIndex))];
    const wrap = shallowReactive([]);
    allMonthYearsIndex.forEach((monthYear) => {
      var _a;
      const monthFirstDayIndex = days.findIndex((day) => day.monthYearIndex === monthYear);
      const nextMonthFirstDayIndex = days.findIndex((day) => day.monthYearIndex === monthYear + 1);
      const monthLastDayIndex = nextMonthFirstDayIndex >= 0 ? nextMonthFirstDayIndex : days.length;
      const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex);
      if (otherMonthsDays) {
        const beforeMonth = ((_a = wrap[wrap.length - 1]) == null ? void 0 : _a.days) || [];
        generateOtherMonthDays(monthDays, beforeMonth, [], fixedWeeks);
      }
      wrap.push(monthFactory(monthDays));
    });
    return wrap;
  }
  function generateMonth(monthYear, options) {
    const {
      fixedWeeks = false,
      otherMonthsDays = false,
      beforeMonthDays = [],
      afterMonthDays = []
    } = options;
    const monthRefDay = new Date(yearFromMonthYear(monthYear), monthFromMonthYear(monthYear));
    const monthDays = generateConsecutiveDays(startOfMonth(monthRefDay), endOfMonth(monthRefDay));
    if (otherMonthsDays) {
      generateOtherMonthDays(monthDays, beforeMonthDays, afterMonthDays, fixedWeeks);
    }
    return monthFactory(monthDays);
  }
  function generateOtherMonthDays(monthDays, monthBefore, monthAfter, fixedWeeks = false) {
    if (monthDays.length <= 0) {
      return;
    }
    completeWeekBefore(monthDays, monthBefore);
    completeWeekAfter(monthDays, monthAfter, fixedWeeks);
  }
  function completeWeekBefore(daysToComplete, previousDays) {
    let beforeDays = [];
    if (previousDays.length > 0) {
      const currentIndex = daysToComplete[0].monthYearIndex;
      const howManyDaysDuplicated = previousDays.slice(-14).filter((day) => day.monthYearIndex === currentIndex).length;
      if (howManyDaysDuplicated > 0) {
        daysToComplete.splice(0, howManyDaysDuplicated);
        const spliceDays = howManyDaysDuplicated > 7 ? 14 : 7;
        const lastDays = previousDays.slice(-spliceDays);
        const lastDaysCopy = lastDays.map(copyCalendarDate);
        lastDays.forEach((day) => {
          day._copied = day.otherMonth;
        });
        lastDaysCopy.forEach((day) => {
          day.otherMonth = !day.otherMonth;
          day._copied = day.otherMonth;
        });
        beforeDays = lastDaysCopy;
      }
    } else {
      const beforeTo = daysToComplete[0].date;
      const beforeFrom = startOfWeek(beforeTo, { weekStartsOn: globalOptions.firstDayOfWeek });
      beforeDays = generateConsecutiveDays(beforeFrom, beforeTo).slice(0, -1);
      beforeDays.forEach((day) => {
        day.otherMonth = true;
      });
    }
    daysToComplete.unshift(...beforeDays);
  }
  function completeWeekAfter(daysToComplete, followingDays, fixedWeeks = false) {
    let afterDays = [];
    if (followingDays.length > 0) {
      const fullWeekCount = Math.floor(daysToComplete.length / 7) + (fixedWeeks ? 0 : 1);
      const needDays = 7 * (6 - fullWeekCount);
      const nextDays = followingDays.slice(0, needDays);
      const nextDaysCopy = nextDays.map(copyCalendarDate);
      nextDays.forEach((day) => {
        day._copied = day.otherMonth;
      });
      nextDaysCopy.forEach((day) => {
        day.otherMonth = !day.otherMonth;
        day._copied = day.otherMonth;
      });
      afterDays = nextDaysCopy;
      const currentIndex = daysToComplete[daysToComplete.length - 1].monthYearIndex;
      const howManyDaysDuplicated = followingDays.slice(0, 14).filter((day) => day.monthYearIndex === currentIndex).length;
      if (howManyDaysDuplicated > 0) {
        daysToComplete.splice(-howManyDaysDuplicated, howManyDaysDuplicated);
      }
    } else {
      const allWeekCount = Math.ceil(daysToComplete.length / 7);
      const afterFrom = daysToComplete[daysToComplete.length - 1];
      const afterTo = endOfWeek(afterFrom.date, { weekStartsOn: globalOptions.firstDayOfWeek });
      if (daysToComplete.length < 36 && fixedWeeks) {
        afterTo.setDate(afterTo.getDate() + 7 * (6 - allWeekCount));
      }
      afterDays = generateConsecutiveDays(afterFrom.date, afterTo).slice(1);
      afterDays.forEach((day) => {
        day.otherMonth = true;
      });
    }
    daysToComplete.push(...afterDays);
  }
  return {
    generateConsecutiveDays,
    generateMonth,
    wrapByMonth
  };
}

// lib/composables/use-monthly-calendar.ts
function monthlyCalendar(globalOptions) {
  const { generateConsecutiveDays, generateMonth, wrapByMonth } = monthGenerators(globalOptions);
  return function useMonthlyCalendar(opts = {}) {
    const { infinite = true, fullWeeks = true, fixedWeeks = false } = opts;
    const monthlyDays = generateConsecutiveDays(
      startOfMonth2(globalOptions.startOn),
      endOfMonth2(globalOptions.maxDate || globalOptions.startOn)
    );
    const daysByMonths = wrapByMonth(monthlyDays, fullWeeks, fixedWeeks);
    const {
      currentWrapper,
      jumpTo,
      nextWrapper,
      prevWrapper,
      prevWrapperEnabled,
      nextWrapperEnabled
    } = useNavigation(
      daysByMonths,
      (newIndex) => {
        var _a, _b;
        const newMonth = generateMonth(newIndex, {
          otherMonthsDays: !!fullWeeks,
          fixedWeeks: !!fixedWeeks,
          beforeMonthDays: ((_a = daysByMonths.find((month) => month.index === newIndex - 1)) == null ? void 0 : _a.days) || [],
          afterMonthDays: ((_b = daysByMonths.find((month) => month.index === newIndex + 1)) == null ? void 0 : _b.days) || []
        });
        selection.splice(0, selection.length, ...selection.reverse());
        return newMonth;
      },
      infinite
    );
    const currentMonthYearIndex = computed3(() => {
      return dateToMonthYear(currentMonthAndYear.year, currentMonthAndYear.month);
    });
    const currentMonthAndYear = reactive2({ month: globalOptions.startOn.getMonth(), year: globalOptions.startOn.getFullYear() });
    watch2(currentWrapper, (newWrapper) => {
      if (currentMonthAndYear.month === newWrapper.month && currentMonthAndYear.year === newWrapper.year) {
        return;
      }
      currentMonthAndYear.month = newWrapper.month;
      currentMonthAndYear.year = newWrapper.year;
    });
    watch2(currentMonthAndYear, (newCurrentMonth) => {
      newCurrentMonth.month = Math.min(11, newCurrentMonth.month);
      jumpTo(currentMonthYearIndex.value);
    });
    const days = computed3(() => daysByMonths.flatMap((month) => month.days).filter(Boolean));
    const computeds = useComputeds(days);
    watchEffect(() => {
      disableExtendedDates(days.value, globalOptions.minDate, globalOptions.maxDate);
    });
    const { selection, ...listeners } = useSelectors(computeds.pureDates, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates);
    return {
      currentMonth: currentWrapper,
      currentMonthAndYear,
      currentMonthYearIndex,
      months: daysByMonths,
      days,
      jumpTo,
      nextMonth: nextWrapper,
      prevMonth: prevWrapper,
      prevMonthEnabled: prevWrapperEnabled,
      nextMonthEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners
    };
  };
}

// lib/composables/use-weekly-calendar.ts
import { computed as computed4, watchEffect as watchEffect2 } from "vue";
import { endOfWeek as endOfWeek3, startOfWeek as startOfWeek3 } from "date-fns";

// lib/utils/utils.week.ts
import { endOfWeek as endOfWeek2, getWeek, startOfWeek as startOfWeek2 } from "date-fns";
function weekGenerators(globalOptions) {
  const { generateConsecutiveDays } = generators(globalOptions);
  function weekFactory(weekDays) {
    const getNbWeek = (day) => getWeek(day.date, { weekStartsOn: globalOptions.firstDayOfWeek });
    return {
      days: weekDays,
      weekNumber: getNbWeek(weekDays[0]),
      month: weekDays[0].date.getMonth(),
      year: weekDays[0].date.getFullYear(),
      index: parseInt(weekDays[0].date.getFullYear().toString() + getNbWeek(weekDays[0]).toString().padStart(2, "0"), 10)
    };
  }
  function wrapByWeek(days) {
    const firstStartOfWeek = days.findIndex((day) => day.date.getDay() === globalOptions.firstDayOfWeek);
    const weeks = [
      days.slice(0, firstStartOfWeek),
      ...chunk(days.slice(firstStartOfWeek), 7)
    ].filter((chunk2) => chunk2.length > 0).map(weekFactory);
    return weeks;
  }
  function generateWeek(weekYearId) {
    const weekRefDay = new Date(weekYearId.year, 0, weekYearId.weekNumber * 7);
    const weekDays = generateConsecutiveDays(startOfWeek2(weekRefDay), endOfWeek2(weekRefDay));
    const newWeek = weekFactory(weekDays);
    return newWeek;
  }
  return {
    generateConsecutiveDays,
    generateWeek,
    wrapByWeek
  };
}

// lib/composables/use-weekly-calendar.ts
var DEFAULT_MONTLY_OPTS = {
  infinite: false
};
function weeklyCalendar(globalOptions) {
  const { generateConsecutiveDays, wrapByWeek, generateWeek } = weekGenerators(globalOptions);
  return function useWeeklyCalendar(opts) {
    const { infinite } = { ...DEFAULT_MONTLY_OPTS, ...opts };
    const weeklyDays = generateConsecutiveDays(
      startOfWeek3(globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }),
      endOfWeek3(globalOptions.maxDate || globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek })
    );
    disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    const daysByWeeks = wrapByWeek(weeklyDays);
    const days = computed4(() => daysByWeeks.flatMap((week) => week.days));
    watchEffect2(() => {
      disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    });
    const currentWeekIndex = computed4(() => {
      return currentWrapper.value.index;
    });
    const { currentWrapper, jumpTo, nextWrapper, prevWrapper, prevWrapperEnabled, nextWrapperEnabled } = useNavigation(
      daysByWeeks,
      (newWeekIndex) => {
        const year = parseInt(newWeekIndex.toString().slice(0, 4), 10);
        const weekNumber = parseInt(newWeekIndex.toString().slice(4), 10);
        return generateWeek({ year, weekNumber });
      },
      infinite
    );
    const computeds = useComputeds(days);
    const { selection, ...selectors } = useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates);
    return {
      currentWeek: currentWrapper,
      currentWeekIndex,
      days,
      weeks: daysByWeeks,
      jumpTo,
      nextWeek: nextWrapper,
      prevWeek: prevWrapper,
      prevWeekEnabled: prevWrapperEnabled,
      nextWeekEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners: selectors
    };
  };
}

// lib/use-calendar.ts
import { unref } from "vue";
function useCalendar(rawOptions) {
  const options = normalizeGlobalParameters(rawOptions);
  const useMonthlyCalendar = monthlyCalendar(options);
  const useWeeklyCalendar = weeklyCalendar(options);
  return {
    useMonthlyCalendar,
    useWeeklyCalendar,
    useWeekdays: useWeekdays(options)
  };
}
function normalizeGlobalParameters(opts) {
  var _a;
  const minDate = opts.minDate ? new Date(opts.minDate) : void 0;
  const maxDate = opts.maxDate ? new Date(opts.maxDate) : void 0;
  const startOn = opts.startOn ? new Date(opts.startOn) : minDate || new Date();
  const disabled = ((_a = unref(unref(opts.disabled))) == null ? void 0 : _a.map((dis) => new Date(dis))) || [];
  const preSelection = (Array.isArray(opts.preSelection) ? opts.preSelection : [opts.preSelection]).filter(Boolean);
  const factory = generateCalendarFactory(opts.factory);
  const firstDayOfWeek = opts.firstDayOfWeek || 0;
  return { ...opts, startOn, firstDayOfWeek, minDate, maxDate, disabled, preSelection, factory };
}
export {
  dateToMonthYear,
  monthFromMonthYear,
  useCalendar,
  yearFromMonthYear
};
