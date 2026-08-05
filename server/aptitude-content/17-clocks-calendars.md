# Aptitude Learning Document — Clocks & Calendars

> A simple, student-friendly guide to time and dates — "what is the angle between the hands at 3:30?" and "what day of the week was 26 January 1950?"
> Two tools: the two-speed trick for clocks (minute hand 6° a minute, hour hand 0.5°) and the odd-days count for calendars (every ordinary year shifts weekdays by 1).

---

# 17. Clocks & Calendars

> **Lesson Overview:** **Clocks** questions measure the angle between the two hands at a given time — one formula, two speeds, one trick. **Calendars** questions find the weekday of a historic date by counting odd days from a known Monday.
> - **Category:** Logical Reasoning
> - **Difficulty:** Easy
> - **Problems:** 2

---

## 17.1 Clocks

### The Simple Idea

The clock face is a 360° circle. The minute hand races, the hour hand crawls — and the angle between them at any time comes from one formula.

> **The Golden Rule: never compare the hands, compare the angles.** Find where each hand points on the 360° circle, then subtract. The hands themselves are a distraction.

### The Two Speeds (The Only Numbers You Need)

| Hand | One full round | Speed per minute | Memory anchor |
|---|---|---|---|
| Minute hand | 360° in 60 min | **6° per minute** | 360 ÷ 60 = 6 |
| Hour hand | 360° in 12 hours | **0.5° per minute** | 30° per hour, 30 ÷ 60 = 0.5 |

The hour hand is not parked at an hour mark — at 3:30 it sits **halfway** between 3 and 4.

### The Angle Formula

```
Angle = | 30H − 5.5M |
       H = hour (12-hour clock), M = minutes

If the angle is more than 180°, use 360 − angle (the smaller angle)
```

Why 5.5? The minute hand gains 6° on the hour hand's 0.5° every minute — a relative speed of 5.5° per minute.

### Worked Example — The 3:30 Angle

**Question:** Find the angle between the hour and minute hands at 3:30.

```
Step 1 — where is the hour hand?
3 hours × 30° = 90°, plus half an hour × 0.5° per min = 15°
Hour hand at: 90 + 15 = 105°

Step 2 — where is the minute hand?
30 minutes × 6° = 180°

Step 3 — the angle between them:
180 − 105 = 75°

The angle at 3:30 is 75°
```

### The Three Famous Meetings

| Event | How often | Formula |
|---|---|---|
| Hands coincide | Every 65 5/11 minutes | They overlap 11 times in 12 hours |
| Hands at 180° (straight line) | 11 times in 12 hours | Opposite each other |
| Hands at 90° (right angle) | 22 times in 12 hours | Twice every hour, almost |

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Forgetting the hour hand moves | 3:30 treated as 90° | Add 0.5° per minute to the hour hand |
| Reporting the big angle | 285° at 3:30 | If angle > 180°, use 360 − angle |
| Using 24-hour time | 15:30 confused with 3:30 | Convert to 12-hour clock first |
| Mixing the speeds | 0.5° given to the minute hand | Minute = 6°, hour = 0.5° — never swap |

### Quick Self-Test (answers at the bottom)

1. Angle between the hands at 3:30 — (a) 90°  (b) 75°  (c) 105°  (d) 60°
2. Angle between the hands at 6:00 — (a) 0°  (b) 90°  (c) 45°  (d) 180°
3. Angle between the hands at 9:00 — (a) 90°  (b) 60°  (c) 30°  (d) 270°
4. The minute hand moves how many degrees in 1 minute? — (a) 30°  (b) 0.5°  (c) 6°  (d) 60°
5. The hour hand moves how many degrees in 1 minute? — (a) 6°  (b) 0.5°  (c) 30°  (d) 1°

**Answers:** 1→b, 2→d, 3→a, 4→c, 5→b.

### Key Takeaway

Every clock question is angle maths: hour hand at 30H + 0.5M degrees, minute hand at 6M degrees. Subtract, and if the result exceeds 180°, take the smaller angle — the hands always make two angles, and the question wants the smaller one.

---

## 17.2 Calendars

### The Simple Idea

An ordinary year has 52 weeks plus **one extra day**. That extra day is why the same date moves one weekday forward every year — and two weekdays after a leap year. Count those extra days and you can name any date in history.

> **The Golden Rule: only the leftover days matter.** Every complete week changes nothing. Find the odd days, divide by 7, and the remainder is your weekday shift.

### The Odd-Day Dictionary

| Year type | Odd days | Why |
|---|---|---|
| Ordinary year | 1 | 365 = 52 weeks + 1 |
| Leap year | 2 | 366 = 52 weeks + 2 |
| 100 years | 5 | (76 × 1) + (24 × 2) = 124 → 124 mod 7 = 5 |
| 400 years | 0 | The whole 400-year cycle repeats |

**The century rule:** a century year (1900, 2000) is a leap year ONLY if divisible by 400. So 2000 was a leap year; 1900 was not.

### The Four-Step Odd-Day Count

```
Step 1: fix the anchor — 1 January 1900 was a MONDAY
Step 2: count the years from the anchor to the target year,
        adding 1 odd day per ordinary year and 2 per leap year
Step 3: add the odd days from 1 Jan to the target date in the target year
Step 4: total mod 7 → that many weekdays after Monday
        (0 = Monday, 1 = Tuesday ... 6 = Sunday)
```

### Worked Example — Republic Day 1950

**Question:** What day of the week was 26 January 1950?

```
Step 1 — years from 1900 to 1949 = 50 years:
leap years among them (1904 to 1948) = 12
odd days = 50 + 12 = 62 → 62 mod 7 = 6

Step 2 — days in 1950 up to 26 January:
25 days → 25 mod 7 = 4

Step 3 — total shift:
6 + 4 = 10 → 10 mod 7 = 3

Step 4 — 3 weekdays after Monday:
Tuesday, Wednesday, THURSDAY

26 January 1950 was a Thursday ✓
```

### The Leap-Count Shortcut

From 1900 to any year Y (Y ≤ 2099):

```
leaps = (Y − 1904) ÷ 4 rounded down + 1   (when Y ≥ 1904)
ordinary years = (Y − 1900) − leaps
```

Only use it when the span is long — for short spans, list the leap years.

### Common Traps

| Trap | What goes wrong | The fix |
|---|---|---|
| Counting the anchor year | 1900 counted as a leap year | 1900 is not divisible by 400 → ordinary |
| Forgetting Feb 29 | The leap day itself | Leap years add 2 odd days, not 1 |
| Using 365 for everything | Every year treated alike | Check divisibility by 4 and 400 |
| Mixing up mod-7 direction | Adding instead of the remainder | Only the remainder matters — 62 → 6 |
| Double counting the target day | Counting 26 Jan as a full day | Days after 1 Jan: date − 1 |

### Quick Self-Test (answers at the bottom)

1. Day of the week on 26 January 1950 — (a) Wednesday  (b) Friday  (c) Thursday  (d) Saturday
2. Odd days in a leap year — (a) 1  (b) 2  (c) 0  (d) 3
3. Day of the week on 15 August 1947 — (a) Saturday  (b) Friday  (c) Thursday  (d) Monday
4. Which of these is a leap year? — (a) 1900  (b) 1800  (c) 2100  (d) 2000
5. Odd days in 100 ordinary years — (a) 5  (b) 1  (c) 2  (d) 6

**Answers:** 1→c, 2→b, 3→b, 4→d, 5→a.

### Key Takeaway

Calendars are a count of leftovers: 1 odd day per ordinary year, 2 per leap year, century years leap only on divisibility by 400. From the Monday of 1 January 1900, shift by the total remainder and the weekday names itself.
