import { Layout, Menu, message } from "antd";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import PomodoroWidget from "./PomodoroWidget";

const { Header, Content } = Layout;

const menuItems = [
  { key: "dashboard", label: <Link to="/dashboard">Dashboard</Link> },
  { key: "profile", label: <Link to="/profile">Profile</Link> },
];

const AppLayout = () => {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="flex items-center justify-between bg-white shadow px-4">
        <div className="font-bold text-lg text-white flex justify-start w-40">
          Time Manager
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname.replace("/", "") || "dashboard"]}
          items={menuItems}
          className="flex-1"
        />
        <button
          className="ml-4 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </Header>
      <Content className="p-6 bg-gray-50">
        <>
          {contextHolder}
          <Outlet context={messageApi} />
        </>
      </Content>

      <PomodoroWidget />
    </Layout>
  );
};

export default AppLayout;
