import React, { useState, useRef, useEffect } from "react";
import { Button, Modal, Select, message, Progress } from "antd";
import { useTaskStore } from "../store/task";
import { useAuthStore } from "../store/auth";
import axios from "axios";

const POMODORO_MINUTES = 25;
const BREAK_MINUTES = 1;

const PomodoroWidget: React.FC = () => {
  const { tasks } = useTaskStore();
  const token = useAuthStore((s) => s.token);
  const [visible, setVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(POMODORO_MINUTES * 60);
  const timerRef = useRef<any>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const success = (content) => {
    messageApi.open({
      type: "success",
      content: content,
    });
  };

  const info = (content) => {
    messageApi.open({
      type: "info",
      content: content,
    });
  };

  const warning = (content) => {
    messageApi.open({
      type: "warning",
      content: content,
    });
  };

  const startTimer = () => {
    if (!selectedTask && !isBreak) {
      warning("Select a task to start Pomodoro");
      return;
    }
    setIsRunning(true);
    if (!isBreak) {
      setStartTime(new Date());
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          handleTimerComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleTimerComplete = () => {
    if (!isBreak) {
      // Pomodoro session completed
      logSession();
      setIsBreak(true);
      setSecondsLeft(BREAK_MINUTES * 60);
      success("Pomodoro complete! Time for a break.");
    } else {
      // Break completed
      setIsBreak(false);
      setSecondsLeft(POMODORO_MINUTES * 60);
      info("Break over! Ready for next Pomodoro.");
    }
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(POMODORO_MINUTES * 60);
  };

  const logSession = async () => {
    if (!selectedTask || !startTime) return;
    try {
      await axios.post(
        `/api/tasks/${selectedTask}/pomodoro`,
        {
          startTime: startTime.toISOString(),
          endTime: new Date().toISOString(),
          completed: true,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Failed to log Pomodoro session:", err);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!isRunning && secondsLeft === 0) {
      if (!isBreak) {
        // Pomodoro complete
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Pomodoro Complete!", {
            body: "Time for a break.",
          });
        }
      } else {
        // Break complete
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Break Over!", {
            body: "Start your next Pomodoro.",
          });
        }
      }
    }
  }, [isRunning, isBreak, secondsLeft]);

  useEffect(() => {
    // Task due reminders: notify 10 minutes before any due task
    const interval = setInterval(() => {
      if ("Notification" in window && Notification.permission === "granted") {
        const now = Date.now();
        tasks.forEach((task) => {
          if (
            task.dueDate &&
            !task.completed &&
            new Date(task.dueDate).getTime() - now < 10 * 60 * 1000 &&
            new Date(task.dueDate).getTime() - now > 9 * 60 * 1000 // only notify once in this window
          ) {
            new Notification("Task Reminder", {
              body: `Upcoming: ${task.title} is due soon!`,
            });
          }
        });
      }
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const minutes = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");
  const percent = isBreak
    ? (secondsLeft / (BREAK_MINUTES * 60)) * 100
    : (secondsLeft / (POMODORO_MINUTES * 60)) * 100;

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        style={{ position: "fixed", bottom: 32, right: 32, zIndex: 1000 }}
        onClick={() => setVisible(true)}
      >
        Pomodoro Timer
      </Button>
      <Modal
        open={visible}
        onCancel={() => {
          setVisible(false);
          stopTimer();
        }}
        footer={null}
        title="Pomodoro Timer"
        destroyOnClose
      >
        <div className="mb-4">
          <Select
            showSearch
            placeholder="Select a task"
            value={selectedTask}
            onChange={setSelectedTask}
            style={{ width: "100%" }}
            options={tasks.map((t) => ({ value: t.id, label: t.title }))}
            disabled={isRunning}
          />
        </div>
        <div className="flex flex-col items-center mb-4">
          <Progress
            type="circle"
            percent={Math.round(percent)}
            format={() => `${minutes}:${seconds}`}
            size={120}
            status={isBreak ? "success" : "normal"}
          />
          <div className="mt-2 text-lg font-semibold">
            {isBreak ? "Break" : "Pomodoro"}
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button type="primary" onClick={startTimer} block>
              Start
            </Button>
          ) : (
            <Button danger onClick={stopTimer} block>
              Stop
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PomodoroWidget;
