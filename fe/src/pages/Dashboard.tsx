import React, { useEffect } from "react";
import {
  List,
  Card,
  Tag,
  Button,
  Spin,
  message,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Calendar,
  Tabs,
  Badge,
  Row,
  Col,
} from "antd";
import { useTaskStore, type Task } from "../store/task";
import { useAuthStore } from "../store/auth";
import axios from "axios";
import dayjs from "dayjs";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const priorityColors: Record<string, string> = {
  High: "red",
  Medium: "orange",
  Low: "green",
};

const priorities = ["High", "Medium", "Low"];
const categories = ["Study", "Personal", "Work", "Other"];

const Dashboard: React.FC = () => {
  const { tasks, setTasks } = useTaskStore();
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = React.useState(false);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const removeTask = useTaskStore((s) => s.removeTask);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editTask, setEditTask] = React.useState<any>(null);
  const [priorityFilter, setPriorityFilter] = React.useState<
    string | undefined
  >();
  const [categoryFilter, setCategoryFilter] = React.useState<
    string | undefined
  >();
  const [tab, setTab] = React.useState("list");
  const [summary, setSummary] = React.useState<{ daily: any; weekly: any }>({
    daily: null,
    weekly: null,
  });

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(res.data);
      } catch (err: any) {
        message.error(err?.response?.data?.message || "Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [setTasks, token]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [dailyRes, weeklyRes] = await Promise.all([
          axios.get("/api/tasks/summary?range=daily", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/tasks/summary?range=weekly", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setSummary({ daily: dailyRes.data, weekly: weeklyRes.data });
      } catch (err) {
        console.error("Failed to fetch summary", err);
      }
    };
    fetchSummary();
  }, [token, tasks]);

  const handleCreate = async (values: any) => {
    try {
      const res = await axios.post(
        "/api/tasks",
        { ...values },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      addTask(res.data);
      setModalOpen(false);
      form.resetFields();
      message.success("Task created");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to create task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditTask(task);
    editForm.setFieldsValue({
      ...task,
      dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: any) => {
    try {
      const res = await axios.put(
        `/api/tasks/${editTask.id}`,
        { ...values },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      updateTask(res.data);
      setEditModalOpen(false);
      message.success("Task updated");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to update task");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      removeTask(id);
      message.success("Task deleted");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Failed to delete task");
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (!priorityFilter || task.priority === priorityFilter) &&
      (!categoryFilter || task.category === categoryFilter)
  );

  // Group tasks by date for calendar
  const tasksByDate = React.useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((task) => {
      if (task.dueDate) {
        const date = dayjs(task.dueDate).format("YYYY-MM-DD");
        if (!map[date]) map[date] = [];
        map[date].push(task);
      }
    });
    return map;
  }, [tasks]);

  const dateCellRender = (date: dayjs.Dayjs) => {
    const dayTasks = tasksByDate[date.format("YYYY-MM-DD")] || [];
    return (
      <ul className="list-none p-0 m-0">
        {dayTasks.map((task) => (
          <li key={task.id}>
            <Badge
              onClick={() => handleEdit(task)}
              color={priorityColors[task.priority] || "blue"}
              text={task.title}
            />
          </li>
        ))}
      </ul>
    );
  };

  const summaryData = (sum: any) => [
    { name: "Completed", value: sum?.completed || 0 },
    { name: "Remaining", value: (sum?.total || 0) - (sum?.completed || 0) },
  ];
  const COLORS = ["#36cfc9", "#f5222d"];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Tasks</h1>
        <Button type="primary" onClick={() => setModalOpen(true)}>
          New Task
        </Button>
      </div>
      <Row gutter={16} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Today's Progress" bordered={false}>
            {summary.daily ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={summaryData(summary.daily)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {summaryData(summary.daily).map((entry, idx) => (
                      <Cell
                        key={`cell-daily-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Spin />
            )}
            <div className="mt-2 text-center">
              {summary.daily && (
                <span>
                  {summary.daily.completed} / {summary.daily.total} tasks
                  completed today
                </span>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Weekly Progress" bordered={false}>
            {summary.weekly ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={summaryData(summary.weekly)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    label
                  >
                    {summaryData(summary.weekly).map((entry, idx) => (
                      <Cell
                        key={`cell-weekly-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Spin />
            )}
            <div className="mt-2 text-center">
              {summary.weekly && (
                <span>
                  {summary.weekly.completed} / {summary.weekly.total} tasks
                  completed this week
                </span>
              )}
            </div>
          </Card>
        </Col>
      </Row>
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={[
          {
            key: "list",
            label: "List View",
            children: (
              <>
                <div className="flex flex-wrap gap-4 mb-4">
                  <Select
                    allowClear
                    placeholder="Filter by Priority"
                    style={{ width: 180 }}
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    options={priorities.map((p) => ({ value: p, label: p }))}
                  />
                  <Select
                    allowClear
                    placeholder="Filter by Category"
                    style={{ width: 180 }}
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={categories.map((c) => ({ value: c, label: c }))}
                  />
                </div>
                {loading ? (
                  <Spin />
                ) : (
                  <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={filteredTasks}
                    renderItem={(task) => (
                      <List.Item>
                        <Card
                          title={task.title}
                          extra={
                            <Tag
                              color={priorityColors[task.priority] || "blue"}
                            >
                              {task.priority}
                            </Tag>
                          }
                        >
                          <div className="flex flex-col items-start">
                            <div className="mb-2 flex justify-between w-full">
                              <span className="font-semibold">Category:</span>{" "}
                              <span className="pr-5">
                                {task.category || "-"}
                              </span>
                            </div>
                            <div className="mb-2 flex justify-between w-full">
                              <span className="font-semibold">Due:</span>{" "}
                              <span className="pr-5">
                                {task.dueDate
                                  ? new Date(task.dueDate).toLocaleString(
                                      undefined,
                                      {
                                        dateStyle: "full",
                                      }
                                    )
                                  : "-"}
                              </span>
                            </div>
                            <div className="mb-2 flex justify-between w-full">
                              <span className="font-semibold">Status:</span>{" "}
                              <span className="pr-2">
                                {task.completed ? (
                                  <Tag color="green">Completed</Tag>
                                ) : (
                                  <Tag color="red">Pending</Tag>
                                )}
                              </span>
                            </div>
                            <div className="mb-2 flex justify-between w-full">
                              <span className="font-semibold">Notes:</span>{" "}
                              <span className="pr-5">{task.notes}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="small"
                              onClick={() => handleEdit(task)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              danger
                              onClick={() => {
                                setTaskToDelete(task.id);
                                setDeleteModalOpen(true);
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                )}
              </>
            ),
          },
          {
            key: "calendar",
            label: "Calendar View",
            children: <Calendar cellRender={dateCellRender} />,
          },
        ]}
      />

      <Modal
        open={deleteModalOpen}
        title="Delete Task"
        onCancel={() => {
          setDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalOpen(false);
              setTaskToDelete(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => {
              handleDelete(taskToDelete);
              setDeleteModalOpen(false);
              setTaskToDelete(null);
            }}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this task?</p>
        {editTask && (
          <div>
            <p>
              <strong>Title:</strong> {editTask.title}
            </p>
            <p>
              <strong>Description:</strong> {editTask.description || "N/A"}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={modalOpen}
        title="Create New Task"
        onCancel={() => setModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleCreate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />{" "}
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={1} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true }]}
          >
            <Select options={priorities.map((p) => ({ value: p, label: p }))} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select
              allowClear
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={editModalOpen}
        title="Edit Task"
        onCancel={() => setEditModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={editForm} onFinish={handleUpdate}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={1} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker showTime className="w-full" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true }]}
          >
            <Select options={priorities.map((p) => ({ value: p, label: p }))} />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select
              allowClear
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Update Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard;
