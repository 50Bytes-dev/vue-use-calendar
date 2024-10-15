var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  dateToMonthYear: () => dateToMonthYear,
  monthFromMonthYear: () => monthFromMonthYear,
  useCalendar: () => useCalendar,
  yearFromMonthYear: () => yearFromMonthYear
});
module.exports = __toCommonJS(lib_exports);

// lib/composables/use-weekdays.ts
var import_date_fns = require("date-fns");
function useWeekdays({ firstDayOfWeek, locale }) {
  return (weekdayFormat = "iiiii") => {
    const sunday = (0, import_date_fns.nextSunday)(new Date());
    const weekdays = Array.from(Array(7).keys()).map((i) => (0, import_date_fns.addDays)(sunday, i));
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift());
    });
    return weekdays.map((day) => (0, import_date_fns.format)(day, weekdayFormat, { locale }));
  };
}

// lib/composables/use-monthly-calendar.ts
var import_vue5 = require("vue");
var import_date_fns6 = require("date-fns");

// lib/utils/utils.ts
var import_date_fns2 = require("date-fns");
function generators(globalOptions) {
  function generateConsecutiveDays(from, to) {
    var _a;
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const dates = [globalOptions.factory(from)];
    let dayIndex = from.getDate() + 1;
    if ((0, import_date_fns2.isAfter)(from, to)) {
    }
    while ((0, import_date_fns2.isBefore)(((_a = dates[dates.length - 1]) == null ? void 0 : _a.date) || 0, to)) {
      const date = globalOptions.factory(from.getFullYear(), from.getMonth(), dayIndex++);
      date.disabled.value = globalOptions.disabled.some((disabled) => (0, import_date_fns2.isSameDay)(date.date, disabled));
      dates.push(date);
    }
    return dates;
  }
  return {
    generateConsecutiveDays
  };
}
function getBetweenDays(pureDates, first, second) {
  const firstSelectedDayIndex = pureDates.findIndex((day) => (0, import_date_fns2.isSameDay)(day.date, first.date));
  const secondSelectedDayIndex = pureDates.findIndex((day) => (0, import_date_fns2.isSameDay)(day.date, second.date));
  const [lowestDate, greatestDate] = [firstSelectedDayIndex, secondSelectedDayIndex].sort((a, b) => a - b);
  return pureDates.slice(lowestDate + 1, greatestDate);
}
function disableExtendedDates(dates, from, to) {
  const beforeFromDates = from ? dates.slice(0, dates.findIndex((day) => (0, import_date_fns2.isSameDay)(day.date, from))) : [];
  const afterToDates = to ? dates.slice(dates.findIndex((day) => (0, import_date_fns2.isSameDay)(day.date, to))) : [];
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
var import_date_fns3 = require("date-fns");
var import_vue = require("vue");
function generateCalendarFactory(customFactory) {
  const extendFactory = customFactory || ((c) => c);
  return function(...args) {
    const date = new Date(...args);
    const weekDay = date.getDay();
    return extendFactory({
      date,
      isToday: (0, import_date_fns3.isToday)(date),
      isWeekend: weekDay === 0 || weekDay > 6,
      otherMonth: false,
      disabled: (0, import_vue.ref)(false),
      isSelected: (0, import_vue.ref)(false),
      isBetween: (0, import_vue.ref)(false),
      isHovered: (0, import_vue.ref)(false),
      monthYearIndex: dateToMonthYear(date),
      dayId: [date.getFullYear(), date.getMonth(), date.getDate()].join("-"),
      _copied: false
    });
  };
}
function copyCalendarDate(date) {
  return __spreadProps(__spreadValues({}, date), { _copied: true });
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
var import_vue2 = require("vue");
var import_date_fns4 = require("date-fns");
function useComputeds(days) {
  const pureDates = (0, import_vue2.computed)(() => {
    return days.value.filter((day) => !day._copied);
  });
  const selectedDates = (0, import_vue2.computed)(() => {
    return pureDates.value.filter((day) => day.isSelected.value);
  });
  const hoveredDates = (0, import_vue2.computed)(() => {
    return pureDates.value.filter((day) => day.isHovered.value);
  });
  const betweenDates = (0, import_vue2.computed)(() => {
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
  const selection = (0, import_vue2.reactive)([]);
  (0, import_vue2.watch)(selection, () => {
    days.value.forEach((day) => {
      day.isSelected.value = selection.some((selected) => (0, import_date_fns4.isSameDay)(selected, day.date));
    });
    if (selection.length >= 2) {
      const isAsc = (0, import_date_fns4.isBefore)(selection[0], selection[1]);
      const firstOfMonth = (0, import_date_fns4.isBefore)(days.value[0].date, selection[isAsc ? 0 : 1]) ? null : days.value[0];
      const lastOfMonth = (0, import_date_fns4.isAfter)(days.value[days.value.length - 1].date, selection[isAsc ? 1 : 0]) ? null : days.value[days.value.length - 1];
      const firstDate = days.value.find((day) => (0, import_date_fns4.isSameDay)(day.date, selection[0])) || (isAsc ? firstOfMonth : days.value[days.value.length - 1]);
      const secondDate = days.value.find((day) => (0, import_date_fns4.isSameDay)(day.date, selection[1])) || (isAsc ? lastOfMonth : firstOfMonth);
      if (firstDate && secondDate) {
        getBetweenDays(days.value, firstDate, secondDate).forEach((day) => {
          day.isBetween.value = true;
        });
      }
    } else {
      betweenDates.value.forEach((betweenDate) => {
        betweenDate.isBetween.value = false;
      });
    }
  });
  function updateSelection(calendarDate) {
    const selectedDateIndex = selection.findIndex((date) => (0, import_date_fns4.isSameDay)(calendarDate.date, date));
    if (selectedDateIndex >= 0) {
      selection.splice(selectedDateIndex, 1);
    } else {
      selection.push(calendarDate.date);
    }
  }
  function selectSingle(clickedDate) {
    const selectedDate = days.value.find((day) => (0, import_date_fns4.isSameDay)(day.date, selection[0]));
    if (selectedDate) {
      updateSelection(selectedDate);
    }
    updateSelection(clickedDate);
  }
  function selectRange(clickedDate) {
    if (selection.length >= 2 && !clickedDate.isSelected.value) {
      selection.splice(0);
    }
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }
  function selectMultiple(clickedDate) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }
  function hoverMultiple(hoveredDate) {
    if (selectedDates.value.length !== 1) {
      return;
    }
    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
    const betweenDates2 = getBetweenDays(days.value, selectedDates.value[0], hoveredDate);
    betweenDates2.forEach((day) => {
      day.isHovered.value = true;
    });
    hoveredDate.isHovered.value = true;
  }
  function resetHover() {
    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
  }
  return {
    selection,
    selectSingle,
    selectRange,
    selectMultiple,
    hoverMultiple,
    resetHover
  };
}

// lib/composables/use-navigation.ts
var import_vue3 = require("vue");
function useNavigation(daysWrapper, generateWrapper, infinite = false) {
  const currentWrapperIndex = (0, import_vue3.ref)(0);
  const currentWrapper = (0, import_vue3.computed)(() => daysWrapper[currentWrapperIndex.value]);
  const prevWrapperEnabled = (0, import_vue3.computed)(() => infinite || currentWrapperIndex.value > 0);
  const nextWrapperEnabled = (0, import_vue3.computed)(() => infinite || currentWrapperIndex.value < daysWrapper.length - 1);
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
var import_vue4 = require("vue");
var import_date_fns5 = require("date-fns");
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
    const wrap = (0, import_vue4.shallowReactive)([]);
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
    const monthDays = generateConsecutiveDays((0, import_date_fns5.startOfMonth)(monthRefDay), (0, import_date_fns5.endOfMonth)(monthRefDay));
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
      const beforeFrom = (0, import_date_fns5.startOfWeek)(beforeTo, { weekStartsOn: globalOptions.firstDayOfWeek });
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
      const afterTo = (0, import_date_fns5.endOfWeek)(afterFrom.date, { weekStartsOn: globalOptions.firstDayOfWeek });
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
    const monthlyDays = generateConsecutiveDays((0, import_date_fns6.startOfMonth)(globalOptions.startOn), (0, import_date_fns6.endOfMonth)(globalOptions.maxDate || globalOptions.startOn));
    const daysByMonths = wrapByMonth(monthlyDays, fullWeeks, fixedWeeks);
    const {
      currentWrapper,
      jumpTo,
      nextWrapper,
      prevWrapper,
      prevWrapperEnabled,
      nextWrapperEnabled
    } = useNavigation(daysByMonths, (newIndex) => {
      var _a2, _b;
      const newMonth = generateMonth(newIndex, {
        otherMonthsDays: !!fullWeeks,
        fixedWeeks: !!fixedWeeks,
        beforeMonthDays: ((_a2 = daysByMonths.find((month) => month.index === newIndex - 1)) == null ? void 0 : _a2.days) || [],
        afterMonthDays: ((_b = daysByMonths.find((month) => month.index === newIndex + 1)) == null ? void 0 : _b.days) || []
      });
      selection.splice(0, selection.length, ...selection.reverse());
      return newMonth;
    }, infinite);
    const currentMonthAndYear = (0, import_vue5.reactive)({ month: globalOptions.startOn.getMonth(), year: globalOptions.startOn.getFullYear() });
    (0, import_vue5.watch)(currentWrapper, (newWrapper) => {
      if (currentMonthAndYear.month === newWrapper.month && currentMonthAndYear.year === newWrapper.year) {
        return;
      }
      currentMonthAndYear.month = newWrapper.month;
      currentMonthAndYear.year = newWrapper.year;
    });
    (0, import_vue5.watch)(currentMonthAndYear, (newCurrentMonth) => {
      newCurrentMonth.month = Math.min(11, newCurrentMonth.month);
      const currentMonthYearIndex = dateToMonthYear(currentMonthAndYear.year, currentMonthAndYear.month);
      jumpTo(currentMonthYearIndex);
    });
    const days = (0, import_vue5.computed)(() => daysByMonths.flatMap((month) => month.days).filter(Boolean));
    const computeds = useComputeds(days);
    (0, import_vue5.watchEffect)(() => {
      disableExtendedDates(days.value, globalOptions.minDate, globalOptions.maxDate);
    });
    const _a = useSelectors(computeds.pureDates, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates), { selection } = _a, listeners = __objRest(_a, ["selection"]);
    return {
      currentMonth: currentWrapper,
      currentMonthAndYear,
      months: daysByMonths,
      days,
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
var import_vue6 = require("vue");
var import_date_fns8 = require("date-fns");

// lib/utils/utils.week.ts
var import_date_fns7 = require("date-fns");
function weekGenerators(globalOptions) {
  const { generateConsecutiveDays } = generators(globalOptions);
  function weekFactory(weekDays) {
    const getNbWeek = (day) => (0, import_date_fns7.getWeek)(day.date, { weekStartsOn: globalOptions.firstDayOfWeek });
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
  function generateWeek(weekYearId, options) {
    const weekRefDay = new Date(weekYearId.year, 0, weekYearId.weekNumber * 7);
    const weekDays = generateConsecutiveDays((0, import_date_fns7.startOfWeek)(weekRefDay), (0, import_date_fns7.endOfWeek)(weekRefDay));
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
    const { infinite } = __spreadValues(__spreadValues({}, DEFAULT_MONTLY_OPTS), opts);
    const weeklyDays = generateConsecutiveDays((0, import_date_fns8.startOfWeek)(globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }), (0, import_date_fns8.endOfWeek)(globalOptions.maxDate || globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }));
    disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    const daysByWeeks = wrapByWeek(weeklyDays);
    const days = (0, import_vue6.computed)(() => daysByWeeks.flatMap((week) => week.days));
    (0, import_vue6.watchEffect)(() => {
      disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    });
    const currentWeekIndex = (0, import_vue6.ref)(0);
    const { currentWrapper, nextWrapper, prevWrapper, prevWrapperEnabled, nextWrapperEnabled } = useNavigation(daysByWeeks, (newWeekIndex, currentWeek) => {
      const year = parseInt(newWeekIndex.toString().slice(0, 4), 10);
      const weekNumber = parseInt(newWeekIndex.toString().slice(4), 10);
      return generateWeek({ year, weekNumber }, {
        firstDayOfWeek: globalOptions.firstDayOfWeek
      });
    }, infinite);
    const computeds = useComputeds(days);
    const _a = useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates), { selection } = _a, selectors = __objRest(_a, ["selection"]);
    return {
      currentWeek: currentWrapper,
      currentWeekIndex,
      days,
      weeks: daysByWeeks,
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
  const disabled = ((_a = opts.disabled) == null ? void 0 : _a.map((dis) => new Date(dis))) || [];
  const preSelection = (Array.isArray(opts.preSelection) ? opts.preSelection : [opts.preSelection]).filter(Boolean);
  const factory = generateCalendarFactory(opts.factory);
  const firstDayOfWeek = opts.firstDayOfWeek || 0;
  return __spreadProps(__spreadValues({}, opts), { startOn, firstDayOfWeek, minDate, maxDate, disabled, preSelection, factory });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dateToMonthYear,
  monthFromMonthYear,
  useCalendar,
  yearFromMonthYear
});
