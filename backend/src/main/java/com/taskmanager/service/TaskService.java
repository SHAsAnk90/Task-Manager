package com.taskmanager.service;

import com.taskmanager.dto.request.StatusUpdateRequest;
import com.taskmanager.dto.request.TaskRequest;
import com.taskmanager.dto.response.TaskResponse;
import com.taskmanager.entity.*;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<TaskResponse> getTasksByProject(Long projectId, User currentUser) {
        Project project = findProjectAndVerifyAccess(projectId, currentUser);
        return taskRepository.findByProjectId(projectId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse createTask(Long projectId, TaskRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can create tasks");
        }
        Project project = findProjectAndVerifyAccess(projectId, currentUser);

        User assignedTo = null;
        if (request.getAssignedToEmail() != null && !request.getAssignedToEmail().isBlank()) {
            assignedTo = userRepository.findByEmail(request.getAssignedToEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with email: " + request.getAssignedToEmail()));
        }

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .project(project)
                .assignedTo(assignedTo)
                .createdBy(currentUser)
                .build();

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can fully update tasks");
        }
        Task task = findTask(taskId);
        findProjectAndVerifyAccess(task.getProject().getId(), currentUser);

        User assignedTo = null;
        if (request.getAssignedToEmail() != null && !request.getAssignedToEmail().isBlank()) {
            assignedTo = userRepository.findByEmail(request.getAssignedToEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned user not found with email: " + request.getAssignedToEmail()));
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setAssignedTo(assignedTo);

        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(Long taskId, StatusUpdateRequest request, User currentUser) {
        Task task = findTask(taskId);
        findProjectAndVerifyAccess(task.getProject().getId(), currentUser);

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isAssignee = task.getAssignedTo() != null
                && task.getAssignedTo().getId().equals(currentUser.getId());

        if (!isAdmin && !isAssignee) {
            throw new AccessDeniedException("You can only update status of tasks assigned to you");
        }

        task.setStatus(request.getStatus());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long taskId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can delete tasks");
        }
        Task task = findTask(taskId);
        findProjectAndVerifyAccess(task.getProject().getId(), currentUser);
        taskRepository.delete(task);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Task findTask(Long taskId) {
        return taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
    }

    private Project findProjectAndVerifyAccess(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));
        if (!isOwner && !isMember) {
            throw new AccessDeniedException("You are not a member of this project");
        }
        return project;
    }

    TaskResponse toResponse(Task task) {
        boolean overdue = task.getDueDate() != null
                && task.getDueDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.DONE;

        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus())
                .priority(task.getPriority())
                .dueDate(task.getDueDate())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignedTo(task.getAssignedTo() != null ? AuthService.toUserResponse(task.getAssignedTo()) : null)
                .createdBy(AuthService.toUserResponse(task.getCreatedBy()))
                .createdAt(task.getCreatedAt())
                .overdue(overdue)
                .build();
    }
}
