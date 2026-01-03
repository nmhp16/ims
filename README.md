# Item Management System (IMS)

## Description

The Item Management System (IMS) is a Java-based dynamic web application developed using the Spring Boot framework. It enables efficient management of items through CRUD (Create, Read, Update, Delete) operations. The system uses a MySQL database for persistent data storage and includes a RESTful API for external interactions. Additionally, it supports an H2 in-memory database for development and testing.

## Features

- **CRUD Operations**: Perform create, read, update, and delete operations on items.
- **Persistent Storage**: Uses file-based H2 database for data persistence.
- **RESTful API**: Offers a web API for programmatic management of items.
- **API Documentation**: Swagger UI available at `/swagger-ui/index.html`.
- **Input Validation**: Robust validation for data integrity.
- **Web Interface**: Provides a user-friendly interface for manual interaction with the system.

## Technologies Used

- **Languages**: Java, HTML/CSS, JavaScript
- **Frameworks**: Spring Boot, Bootstrap 5
- **Databases**: H2 (File-based)
- **Tools**: Git, Postman, Swagger UI
- **Build Management**: Maven

## Requirements

1. **Java Development Kit (JDK)**:
   - **Version**: 11 or higher.
   - **Download**: [Oracle JDK](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html) or [OpenJDK](https://adoptium.net/) (OpenJDK binaries).

2. **Apache Maven**:
   - **Version**: Latest stable version.
   - **Download**: [Maven](https://maven.apache.org/download.cgi) (for build management and dependency management).

3. **IDE (Integrated Development Environment)**:
   - **Optional but recommended**: IntelliJ IDEA, Eclipse, or another Java IDE.
   - **Download**:
     - [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download/)
     - [Eclipse IDE](https://www.eclipse.org/downloads/)

### Optional Tools

1. **Postman**:
   - **Version**: Latest stable version.
   - **Download**: [Postman](https://www.postman.com/downloads/) (for testing the RESTful API endpoints).

2. **Database Management Tool**:
   - **Optional**: MySQL Workbench or another database management tool for easier database administration.
   - **Download**: 
     - [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)

## Installation

1. **Clone the Repository**:

    ```bash
    git clone https://github.com/nmhp16/ims.git
    ```

2. **Navigate to the Project Directory**:

    ```bash
    cd ims
    ```

3. **Build the Project**:

    ```bash
    mvn clean install
    ```

4. **Run the Application**:

    ```bash
    mvn spring-boot:run
    ```

## Usage

Once the application is running, access it via [http://localhost:8084](http://localhost:8084). You can interact with the Item Management System through the web interface or use the provided RESTful API endpoints to manage items programmatically.

## API Endpoints

- **GET /items**: Retrieve a list of items.
- **GET /items/{id}**: Retrieve details of a specific item by its ID.
- **POST /items**: Create a new item.
- **PUT /items/{id}**: Update an existing item by its ID.
- **DELETE /items/{id}**: Delete an item by its ID.

