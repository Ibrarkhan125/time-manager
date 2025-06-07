import React, { useState } from "react";
import { Form, Input, Button, message, Card, Row, Col } from "antd";
import { useAuthStore } from "../store/auth";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [summary, setSummary] = useState<{ daily: any; weekly: any }>({
    daily: null,
    weekly: null,
  });

  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({ name: user.name, email: user.email });
    }
  }, [user, form]);

  React.useEffect(() => {
    // Fetch daily/weekly summary for this user
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
  }, [token]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await axios.put("/api/user/profile", values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuth(token!, res.data);
      message.success("Profile updated");
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const summaryData = (sum: any) => [
    { name: "Completed", value: sum?.completed || 0 },
    { name: "Remaining", value: (sum?.total || 0) - (sum?.completed || 0) },
  ];
  const COLORS = ["#36cfc9", "#f5222d"];

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card title="Profile & Settings">
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            {" "}
            <Input />{" "}
          </Form.Item>
          <Form.Item name="password" label="New Password" rules={[{ min: 6 }]}>
            {" "}
            <Input.Password />{" "}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Row gutter={16} className="mt-6">
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
              <span>Loading...</span>
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
              <span>Loading...</span>
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
    </div>
  );
};

export default Profile;
