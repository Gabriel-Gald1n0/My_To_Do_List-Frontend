'use client'

import { FormEvent, useEffect, useState } from "react"
import Styles from "./page.module.css"

import Priority from "@/components/Priority"
import Task from "@/components/Task"
import Button from "@/components/Button"
import PrivateRoute from "@/components/PrivateRoute"
import { decodeAction } from "next/dist/server/app-render/entry-base"
import axios from "axios"
import router from "next/router"


interface Task {
    id: number;
    title: string;
    description: string;
    priority?: 'going' | 'low' | 'medium' | 'high' | 'finished' | null;
    deadline?: Date | null;
}

type PriorityType = 'going' | 'low' | 'medium' | 'high' | 'finished' | null;

export default function Tasks() {
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [idCounter, setIdCounter] = useState(0)
    const [tasks, setTasks] = useState([] as Task[])
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'going',
        deadline: null,
    } as Task);

    useEffect(() => {
        // Função para buscar dados do banco de dados
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token not found');
                }

                const response = await axios.get('http://localhost:3001/api/tasks', {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                });
                setTasks(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };

        // Chama a função para buscar dados do banco de dados ao montar o componente
        fetchData();
    }, []); // [] como segundo argumento para garantir que useEffect seja chamado apenas uma vez ao montar o componente

    async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/api/login', Credential);
            localStorage.setItem('token', response.data.accessToken);
            // Após o login bem-sucedido, buscar os dados das tarefas
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }

            const tasksResponse = await axios.get('http://localhost:3001/api/tasks', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            setTasks(tasksResponse.data);
            router.push('/tasks');
        } catch (error) {
            console.log(error);
        }
    }

    function handleAddNewTask(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setNewTask({
            ...newTask,
            id: idCounter
        })
        setTasks([...tasks, newTask])
        setIdCounter(idCounter + 1)
        setNewTask({
            id: idCounter,
            title: '',
            description: '',
            priority: 'going',
            deadline: null,
        })
        setModalIsOpen(false)
    }

    function handleDeleteTask(id: number) {
        setTasks(tasks.filter((task) => task.id !== id))
    }

    return (
        <PrivateRoute>
            {modalIsOpen && (
                <div className={Styles.modal}>
                    <div className={Styles.modalContent}>

                        <form
                            onSubmit={(e) => handleAddNewTask(e)}
                            className={Styles.form}
                        >

                            <div className={Styles.modalHeader}>
                                <input
                                    type="text"
                                    placeholder="Título"
                                    onChange={(e) => setNewTask({
                                        ...newTask,
                                        title: e.target.value
                                    })}
                                />

                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => setModalIsOpen(false)}
                                >
                                    X
                                </Button>
                            </div>

                            <div>
                                <p className={Styles.modalLineH}></p>
                            </div>

                            <div className={Styles.modalSelect}>

                                <select
                                    value={newTask.priority || "no"}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            priority: (e.target.value === "no" ?
                                                null : e.target.value) as
                                                PriorityType
                                        })
                                    }
                                >
                                    <option value="no">
                                        <Priority type="going" />
                                    </option>
                                    <option value="low">
                                        <Priority type="low" />
                                    </option>
                                    <option value="medium">
                                        <Priority type="medium" />
                                    </option>
                                    <option value="high">
                                        <Priority type="high" />
                                    </option>
                                </select>

                                <input
                                    type="date"
                                    className={Styles.inputDate}
                                    onChange={(e) =>
                                        setNewTask({
                                            ...newTask,
                                            deadline: e.target.value ? new Date(e.target.value) : null
                                        })
                                    }
                                />
                            </div>

                            <textarea
                                placeholder="Descrição"
                                onChange={(e) =>
                                    setNewTask({
                                        ...newTask,
                                        description: e.target.value
                                    })
                                }
                            />
                            <div className={Styles.modalButton}>
                                <Button
                                    size="lg"
                                    variant="primary"
                                >
                                    Adicionar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className={Styles.container}>

                <div className={Styles.titleContainer}>
                    <header>
                        <h1>My To Do List</h1>
                    </header>
                </div>

                <div className={Styles.tasksContainer}>

                    <header className={Styles.header}>
                        <h2>Tarefas</h2>
                        <Button
                            size="md"
                            variant="primary"
                            onClick={() => setModalIsOpen(true)}
                        >
                            + Nova Tarefa
                        </Button>
                    </header>

                    <div className={Styles.headerContainer}>
                        <p className={Styles.lineH}></p>
                    </div>

                    <main className={Styles.main}>

                        {tasks.map((task) => {
                            return (
                                <Task
                                    key={task.id}
                                    title={task.title}
                                    description={task.description}
                                    {...task.priority && { priority: task.priority }}
                                    {...task.deadline && { deadline: task.deadline }}
                                    onDelete={() => handleDeleteTask(task.id)}
                                />
                            )
                        })}

                    </main>

                </div>
            </div>
        </PrivateRoute>
    )
}