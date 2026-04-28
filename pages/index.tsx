import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Button, Form, Input, message, Modal, Space, Table, Tag, DatePicker, Select } from "antd";

type Todo = {
  id: number;
  title: string;
  completed: boolean;
  dueDate?: string;
  priority?: string;
};

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 12 },
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [editForm] = Form.useForm();

  const completedCount = todos.filter((todo) => todo.completed).length;
  const pendingCount = todos.filter((todo) => !todo.completed).length;
  const overdueCount = todos.filter((todo) => {
    if (!todo.dueDate || todo.completed) return false;
    const due = new Date(todo.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const onFinish = async (values: any) => {
    setIsModalOpen(false);

    fetch('/api/create_todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: values.title,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        priority: values.priority
      })
    }).then(async response => {
      if (response.status === 200) {
        const todo = await response.json();
        message.success('Created task ' + todo.title);
        setTodos([...todos, todo]);
      } else {
        message.error('Failed to create task');
      }
    });
  };

  const onDelete = async (todo: any) => {
    fetch('/api/delete_todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: todo.id })
    }).then(async response => {
      if (response.status === 200) {
        message.success('Deleted task');
        setTodos(todos.filter(t => t.id !== todo.id));
      }
    });
  };

  const onToggle = async (todo: Todo) => {
    fetch('/api/update_todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: todo.id,
        completed: !todo.completed
      })
    }).then(async response => {
      if (response.status === 200) {
        const updated = await response.json();
        setTodos(todos.map(t => t.id === updated.id ? updated : t));
      }
    });
  };

  const showEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalOpen(true);
    editForm.setFieldsValue({ title: todo.title });
  };

  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditingTodo(null);
  };

  const onEditFinish = async (values: any) => {
    fetch('/api/edit_todo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingTodo?.id,
        title: values.title
      })
    }).then(async response => {
      if (response.status === 200) {
        const updated = await response.json();
        setTodos(todos.map(t => t.id === updated.id ? updated : t));
        setIsEditModalOpen(false);
        setEditingTodo(null);
      }
    });
  };

  const columns: ColumnsType<Todo> = [
    {
      title: 'Task',
      dataIndex: 'title',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      sorter: (a, b) => {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aTime - bTime;
      },
      sortDirections: ['ascend', 'descend'],
      render: (date, record) => {
        if (!date) return 'No date';

        const due = new Date(date);
        const today = new Date();

        due.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        if (record.completed) {
          return <Tag color="green">{due.toLocaleDateString()}</Tag>;
        }

        if (due < today) {
          return <Tag color="red">Overdue {due.toLocaleDateString()}</Tag>;
        }

        if (due.getTime() === today.getTime()) {
          return <Tag color="orange">Due Today</Tag>;
        }

        return <Tag color="blue">{due.toLocaleDateString()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'completed',
      sorter: (a, b) => Number(a.completed) - Number(b.completed),
      sortDirections: ['ascend', 'descend'],
      render: (completed, record) => {
        if (completed) {
          return <Tag color="green">Done</Tag>;
        }

        if (record.dueDate) {
          const due = new Date(record.dueDate);
          const today = new Date();

          due.setHours(0,0,0,0);
          today.setHours(0,0,0,0);

          if (due < today) {
            return <Tag color="red">Overdue</Tag>;
          }

          if (due.getTime() === today.getTime()) {
            return <Tag color="orange">Due Today</Tag>;
          }
        }

        return <Tag color="blue">Pending</Tag>;
      },
    },
    
    {
      title: 'Priority',
      dataIndex: 'priority',
      sorter: (a, b) => {
        const order = { High: 0, Medium: 1, Low: 2 } as Record<string, number>;
        const aValue = order[a.priority ?? 'Medium'];
        const bValue = order[b.priority ?? 'Medium'];
        return aValue - bValue;
      },
      sortDirections: ['ascend', 'descend'],
      render: (priority) => {
        if (priority === 'High') {
          return <Tag color = "red">High</Tag>;
        }
        if (priority === "Medium") {
          return <Tag color = "yellow">Medium</Tag>;
        }
        return <Tag color = "green">Low</Tag>;
      },
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <a onClick={() => showEditModal(record)}>Edit</a>
          <a onClick={() => onToggle(record)}>Toggle</a>
          <a onClick={() => onDelete(record)}>Delete</a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetch('/api/all_todo')
      .then(res => res.json())
      .then(json => setTodos(json));
  }, []);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="eyebrow">CSCI 8656 Project</div>
        <h1 className="page-title">Task Tracker</h1>
        <p className="page-subtitle">
          A simple app made to track items on your TODO list.
          <br />
          Add something new, update a task, or celebrate a finished item.
        </p>
      </header>

      <section className="hero-card">
        <div className="actions-row">
          <Button className="button-primary" type="primary" onClick={() => setIsModalOpen(true)}>
            Add a new task
          </Button>
          <div className="stat-card">
            <div className="stat-title">Total tasks</div>
            <div className="stat-value">{todos.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Pending</div>
            <div className="stat-value">{pendingCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Overdue</div>
            <div className="stat-value">{overdueCount}</div>
          </div>
        </div>
      </section>

      <div className="table-wrapper">
        <Table columns={columns} dataSource={todos} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>

      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} onFinish={onFinish} {...layout}>
          <Form.Item name="title" label="Task" rules={[{ required: true, message: 'Please enter a task name.' }]}> 
            <Input placeholder="Write something you'd like to complete" />
          </Form.Item>

          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="priority" label="Priority" initialValue="Medium">
            <Select>
              <Select.Option value="Low">Low</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="High">High</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">Add task</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={isEditModalOpen} onCancel={handleEditCancel} footer={null}>
        <Form form={editForm} onFinish={onEditFinish} {...layout}>
          <Form.Item name="title" label="Task" rules={[{ required: true, message: 'Please enter a task name.' }]}> 
            <Input placeholder="Update this task name" />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">Update task</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
