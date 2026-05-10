package com.taskmanager.dto.request;

import com.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private TaskStatus status;
}
