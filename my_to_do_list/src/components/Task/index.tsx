import Style from "./page.module.css";
import Priority from "../Priority";
import { FiTrash2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import axios from 'axios';
import PrivateRoute from "../PrivateRoute";

interface TaskProps {
    title: string;
    description?: string;
    priority?: 'going' | 'low' | 'medium' | 'high' | 'finished' | null;
    deadline?: Date;
    onDelete?: () => void;
}

export default function Task({ title, description, priority, deadline, onDelete }: TaskProps) {
    const [isChecked, setIsChecked] = useState(priority === 'finished');
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        async function fetchTasks() {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get('http://localhost:3001/api/tasks', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    setTasks(response.data);
                }
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        }

        fetchTasks();
    }, []);

    return (
        <PrivateRoute>
            <div className={`${Style.taskContainer} ${isChecked && Style.finished}`}>

                <header>

                    <div className={Style.options}>

                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                        />

                        <div className={Style.info}>

                            <h3 className={Style.lineTitle}>
                                {title}
                            </h3>

                            <div className={Style.taskInfo}>

                                {deadline && (
                                    <p>Prazo: {deadline?.toLocaleDateString()}</p>
                                )}

                                {priority && !isChecked ? (
                                    <Priority type={priority} />
                                ) : (
                                    isChecked && <Priority type="finished" />
                                )}

                            </div>

                        </div>

                        <button onClick={onDelete}>
                            <FiTrash2 />
                        </button>

                    </div>

                </header>

                {description && <p className={Style.description}>{description}</p>}

            </div>
        </PrivateRoute>
    )
}
