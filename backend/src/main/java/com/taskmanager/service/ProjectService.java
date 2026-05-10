package com.taskmanager.service;

import com.taskmanager.dto.request.AddMemberRequest;
import com.taskmanager.dto.request.ProjectRequest;
import com.taskmanager.dto.response.ProjectResponse;
import com.taskmanager.dto.response.UserResponse;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Role;
import com.taskmanager.entity.User;
import com.taskmanager.exception.ResourceNotFoundException;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public List<ProjectResponse> getMyProjects(Long userId) {
        return projectRepository.findAllByUserId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can create projects");
        }
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();
        project.getMembers().add(currentUser);
        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse getProjectById(Long projectId, User currentUser) {
        Project project = findProjectAndVerifyAccess(projectId, currentUser);
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can update projects");
        }
        Project project = findProjectAndVerifyAccess(projectId, currentUser);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long projectId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can delete projects");
        }
        Project project = findProjectAndVerifyAccess(projectId, currentUser);
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse addMember(Long projectId, AddMemberRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can add members");
        }
        Project project = findProjectAndVerifyAccess(projectId, currentUser);
        User newMember = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));
        project.getMembers().add(newMember);
        return toResponse(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse removeMember(Long projectId, Long userId, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AccessDeniedException("Only admins can remove members");
        }
        Project project = findProjectAndVerifyAccess(projectId, currentUser);
        User member = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        project.getMembers().remove(member);
        return toResponse(projectRepository.save(project));
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Project findProjectAndVerifyAccess(Long projectId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));
        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        boolean isMember = project.getMembers().stream()
                .anyMatch(m -> m.getId().equals(currentUser.getId()));
        if (!isOwner && !isMember) {
            throw new AccessDeniedException("You are not a member of this project");
        }
        return project;
    }

    private ProjectResponse toResponse(Project project) {
        List<UserResponse> members = project.getMembers().stream()
                .map(AuthService::toUserResponse).collect(Collectors.toList());
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .owner(AuthService.toUserResponse(project.getOwner()))
                .members(members)
                .createdAt(project.getCreatedAt())
                .build();
    }
}
