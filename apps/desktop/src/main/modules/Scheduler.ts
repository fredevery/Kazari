import { BaseModule } from "@/main/base/BaseModule.ts";
import { Phases } from "@/shared/enums.ts";
import { config } from "@/main/modules/Config.ts";
import {
  todayAsName,
  timeToDate,
  timeDifferenceInMs,
  timeAdd,
} from "@/shared/dateUtils.ts";

type DayAvailability = {
  day: string;
  timeBlocks: TimeBlock[];
};

type TimeBlock = {
  startTime: string;
  endTime: string;
};

type ScheduleConfig = {
  availability: DayAvailability[];
};

class ScheduleSlot {
  public readonly startDateTime: Date;
  public readonly endDateTime: Date;

  constructor(startDateTime: Date, endDateTime: Date) {
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
  }
}

const phases = [
  // {
  //   type: Phases.PLANNING,
  //   allocatedTime: 5 * 60 * 1000, // 5 minutes
  // },
  {
    type: Phases.FOCUS,
    allocatedTime: 25 * 60 * 1000, // 25 minutes
  },
  {
    type: Phases.BREAK,
    allocatedTime: 5 * 60 * 1000, // 5 minutes
  },
];

export class Scheduler extends BaseModule {
  private config: ScheduleConfig = { availability: [] };
  private slots: ScheduleSlot[] = [];

  constructor() {
    super();
    this.loadConfig();
    this.generateSlots();
  }

  private loadConfig() {
    const scheduleConfig = config.get("schedule");
    this.config = scheduleConfig || {};
  }

  private getTodaysAvailability() {
    const today = todayAsName();
    const todaysAvailability = this.config.availability?.find(
      (dayAvailability: DayAvailability) => dayAvailability.day === today,
    ) || { timeBlocks: [] };
    return todaysAvailability.timeBlocks;
  }

  private generateSlots() {
    const cycleDuration = phases.reduce(
      (total, phase) => total + phase.allocatedTime,
      0,
    );
    const slots = this.getTodaysAvailability().flatMap((block: TimeBlock) => {
      const duration = timeDifferenceInMs(block.startTime, block.endTime);
      let allocatedTime = phases[0].allocatedTime; // Start with the first phase time
      const phaseSlots = [
        {
          type: Phases.PLANNING,
          allocatedTime: 5 * 60_000, // 5 minutes
          startTime: timeToDate(block.startTime),
          endTime: timeAdd(block.startTime, 5 * 60_000), // 5 minutes
        },
      ];
      let i = 0;
      while (allocatedTime < duration) {
        const phase = phases[i % phases.length];
        if (duration - allocatedTime < phase.allocatedTime) {
          // If the remaining duration is less than the phase time, break
          break;
        }
        const phaseSlot = {
          ...phase,
          startTime: timeAdd(block.startTime, allocatedTime),
          endTime: timeAdd(
            block.startTime,
            allocatedTime + phase.allocatedTime,
          ),
        };
        allocatedTime += phase.allocatedTime;
        phaseSlots.push(phaseSlot);
        i++;
      }
      return phaseSlots;
    });
  }

  public getAvailableSlots(): ScheduleSlot[] {
    return [];
  }
}
