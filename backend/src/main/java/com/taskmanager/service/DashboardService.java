package com.taskmanager.service;

import com.taskmanager.dto.response.DashboardResponse;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public DashboardResponse getDashboard(User currentUser) {
        Long userId = currentUser.getId();

        long totalTasks      = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.TODO)
                             + taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.IN_PROGRESS)
                             + taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DONE);
        long todoCount       = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.TODO);
        long inProgressCount = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long doneCount       = taskRepository.countByAssignedToIdAndStatus(userId, TaskStatus.DONE);
        long overdueCount    = taskRepository.countOverdueTasks(userId, LocalDate.now());
        long totalProjects   = projectRepository.findAllByUserId(userId).size();

        return DashboardResponse.builder()
                .totalTasks(totalTasks)
                .todoCount(todoCount)
                .inProgressCount(inProgressCount)
                .doneCount(doneCount)
                .overdueCount(overdueCount)
                .totalProjects(totalProjects)
                .build();
    }
}
