# Use a Maven image with Java 17
FROM maven:3.9.6-eclipse-temurin-17 AS build

# Install Node.js to build the frontend
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

WORKDIR /app

# Copy all project files
COPY . .

# Install root dependencies (if any) and run the full build
# This will build the frontend, then compile the backend into a .jar
RUN npm install
RUN npm run build

# Stage 2: Create a lightweight production image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy only the compiled .jar file from the previous stage
COPY --from=build /app/backend/target/*.jar app.jar

# Expose the standard Spring Boot port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
