package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssignedToId(Long userId);

    // Count tasks assigned to user grouped by status
    long countByAssignedToIdAndStatus(Long userId, TaskStatus status);

    // Overdue: due before today and not DONE
    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTo.id = :userId AND t.dueDate < :today AND t.status <> 'DONE'")
    long countOverdueTasks(@Param("userId") Long userId, @Param("today") LocalDate today);

    // All tasks across projects the user is member of (for admin dashboard)
    @Query("SELECT t FROM Task t WHERE t.project.id IN :projectIds")
    List<Task> findByProjectIdIn(@Param("projectIds") List<Long> projectIds);
}
