'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Field,
    FieldControl,
    FieldLabel,
    FieldError,
} from "@/components/ui/field";

import { Loader2 } from 'lucide-react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileInput } from '@/components/ui/FileInput';
import toast from 'react-hot-toast';
import { createTask } from '@/actions/task/create-task';
import { updateTask } from '@/actions/task/update-task';

export type Status = 'todo' | 'in-progress' | 'review' | 'done';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: Status;
    priority: 'low' | 'medium' | 'high';
    created_at: string | number;
    updated_at?: string | number;
    image: string | null;
    user_id?: string;
}

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task | null;
    onSuccess: () => void;
}

const taskSchema = z.object({
    title: z.string().min(1, 'El título es requerido'),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'review', 'done'] as const),
    priority: z.enum(['low', 'medium', 'high'] as const),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export function TaskForm({ isOpen, onClose, task, onSuccess }: TaskFormProps) {
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [removeImage, setRemoveImage] = useState(false);

    const form = useForm<TaskFormValues>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: '',
            description: '',
            status: 'todo',
            priority: 'medium',
        },
    });

    const { handleSubmit, formState, register, watch, setValue } = form;
    const { errors } = formState;

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
            });
            setSelectedFile(null);
            setRemoveImage(false);
        } else {
            form.reset({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
            });
            setSelectedFile(null);
            setRemoveImage(false);
        }
    }, [task, form, isOpen]);

    const onSubmit = async (data: TaskFormValues) => {
        setLoading(true);

        try {
            if (task) {
                // Update existing task
                const { task: updatedTask, error } = await updateTask({
                    taskId: task.id,
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    image: selectedFile || undefined,
                    existingImage: task.image,
                    removeImage,
                });

                if (error) {
                    toast.error(error);
                    return;
                }

                toast.success('Tarea actualizada exitosamente');
            } else {
                // Create new task
                const { task: newTask, error } = await createTask({
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    image: selectedFile || undefined,
                });

                if (error) {
                    toast.error(error);
                    return;
                }

                toast.success('Tarea creada exitosamente');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving task:', error);
            toast.error('Error al guardar la tarea');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="lg:w-xl md:w-full w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{task ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <Field>
                        <FieldLabel>Título</FieldLabel>
                        <FieldControl>
                            <Input {...register('title')} placeholder="Título de la tarea" disabled={loading} />
                        </FieldControl>
                        {errors.title && <FieldError>{errors.title.message}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>Descripción</FieldLabel>
                        <FieldControl>
                            <Textarea {...register('description')} placeholder="Describe lo que hay que hacer..." rows={3} disabled={loading} />
                        </FieldControl>
                        {errors.description && <FieldError>{errors.description.message}</FieldError>}
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Estado</FieldLabel>
                            <Select onValueChange={(value) => setValue('status', value as Status)} defaultValue={watch('status')} value={watch('status')}>
                                <FieldControl>
                                    <SelectTrigger disabled={loading}>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FieldControl>
                                <SelectContent>
                                    <SelectItem value="todo">Pendiente</SelectItem>
                                    <SelectItem value="in-progress">En curso</SelectItem>
                                    <SelectItem value="review">En revisión</SelectItem>
                                    <SelectItem value="done">Completado</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <FieldError>{errors.status.message}</FieldError>}
                        </Field>

                        <Field>
                            <FieldLabel>Prioridad</FieldLabel>
                            <Select onValueChange={(value) => setValue('priority', value as any)} defaultValue={watch('priority')} value={watch('priority')}>
                                <FieldControl>
                                    <SelectTrigger disabled={loading}>
                                        <SelectValue />
                                    </SelectTrigger>
                                </FieldControl>
                                <SelectContent>
                                    <SelectItem value="low">Baja</SelectItem>
                                    <SelectItem value="medium">Media</SelectItem>
                                    <SelectItem value="high">Alta</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.priority && <FieldError>{errors.priority.message}</FieldError>}
                        </Field>
                    </div>

                        <div className="space-y-2">
                            <FileInput
                                accept="image/jpeg, image/png, image/gif, image/webp"
                                multiple={false}
                                onFilesSelected={(files) => {
                                    if (files.length > 0) {
                                        setSelectedFile(files[0] as File);
                                        setRemoveImage(false);
                                    } else {
                                        setSelectedFile(null);
                                        if (task?.image) setRemoveImage(true);
                                    }
                                }}
                                initialImageUrl={task?.image || undefined}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {task ? 'Actualizar' : 'Crear'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
            </DialogContent>
        </Dialog>
    );
}
