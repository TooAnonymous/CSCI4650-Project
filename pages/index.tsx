import { Inter } from 'next/font/google'
import { useEffect, useState } from "react";
import { ColumnsType } from "antd/es/table";
import { Button, Form, Input, message, Modal, Space, Table, Tag } from "antd";

const inter = Inter({ subsets: ['latin'] })

type Todo = {
  id: number;
  title: string;
  completed: boolean;
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

  const onFinish = async (values: any) => {
    setIsModalOpen(false);

    fetch('/api/create_todo', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
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
    const { id } = todo;

    fetch('/api/delete_todo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id })
    }).then(async response => {
      if (response.status === 200) {
        message.success('Deleted task');
        setTodos(todos.filter(t => t.id !== id));
      }
    });
  };

  const columns: ColumnsType<Todo> = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Status',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed) => (
        completed ? <Tag color="green">Done</Tag> : <Tag color="red">Pending</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => onDelete(record)}>Delete</a>
        </Space>
      ),
    },
  ];

  const showModal = () => {
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  useEffect(() => {
    fetch('api/all_todo')
      .then(res => res.json())
      .then(json => setTodos(json));
  }, []);

  return <>
    <Button type="primary" onClick={showModal}>
      Add Task
    </Button>

    <Modal
      title="Add Task"
      onCancel={handleCancel}
      open={isModalOpen}
      footer={null}
      width={600}
    >
      <Form
        {...layout}
        form={form}
        name="todo-form"
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          label="Task"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="button" onClick={() => form.resetFields()}>
            Reset
          </Button>
          <Button htmlType="button" onClick={handleCancel}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>

    <Table columns={columns} dataSource={todos} rowKey="id" />
  </>;
}