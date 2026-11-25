# Software Requirements Specification (SRS)

## CineTrack — Personal Film & Series Tracker

**Document ID:** CT-SRS-001\
**Version:** 1.0\
**Status:** Draft\
**Platform:** Android\
**Framework:** React Native + Expo\
**Database:** SQLite (Local Storage)

---

# 1. Introduction

## 1.1 Purpose

This document defines the functional and non-functional requirements of CineTrack, a mobile application designed to help users organize and manage their personal movie and television series watchlists.

The SRS serves as the primary reference for system design, implementation, and testing.

## 1.2 Product Scope

CineTrack allows users to manage their personal movie and series collections through basic CRUD operations.

Users can add titles, view details, edit information, delete entries, track viewing status, search their collections, filter content, and assign personal ratings.

All application data is stored locally using SQLite. Internet connectivity and user registration are not required.

## 1.3 Intended Audience

- Students and developers involved in the project.
- Software testers.
- Project evaluators.
- Anyone reviewing the application's technical requirements.

## 1.4 Definitions and Abbreviations

| Term      | Definition                                 |
| --------- | ------------------------------------------ |
| SRS       | Software Requirements Specification        |
| CRUD      | Create, Read, Update, Delete               |
| UI        | User Interface                             |
| SQLite    | Embedded relational database               |
| Movie     | A standalone film                          |
| Series    | Episodic television content                |
| Watchlist | A collection of titles managed by the user |
| Rating    | Personal score assigned to a title         |

# 2. Overall Description

## 2.1 Product Perspective

CineTrack is a standalone Android mobile application.

The application operates independently without requiring an external backend, authentication service, or third-party movie database.

The application consists of three primary layers:

1. Presentation Layer — displays the user interface and handles user interactions.
2. Application Logic Layer — processes user actions and application rules.
3. Data Layer — manages local data persistence through SQLite.

## 2.2 Product Functions

The main functions of CineTrack include:

- Displaying a personal movie and series collection.
- Adding new movies and series.
- Viewing detailed information.
- Editing existing entries.
- Deleting entries.
- Managing viewing statuses.
- Searching titles.
- Filtering by content type and viewing status.
- Assigning personal ratings.
- Displaying collection statistics (optional enhancement).

## 2.3 User Characteristics

CineTrack is designed for general smartphone users who have basic familiarity with mobile applications.

No technical knowledge or account registration is required.

## 2.4 Operating Environment

| Component               | Requirement             |
| ----------------------- | ----------------------- |
| Operating System        | Android                 |
| Development Environment | Expo                    |
| Runtime                 | Expo Go                 |
| Programming Language    | JavaScript              |
| Framework               | React Native            |
| Database                | SQLite                  |
| Database Integration    | expo-sqlite             |
| Navigation              | React Navigation        |
| UI Styling              | React Native StyleSheet |

## 2.5 Design Constraints

- The application must use React Native and Expo.
- The application must be compatible with Expo Go during development.
- All primary application data must be stored locally.
- The application must not require an internet connection for its primary functionality.
- The application must use a consistent dark interface.
- The application must not require authentication.
- External movie information APIs are outside the project scope.

## 2.6 Assumptions and Dependencies

- The user has an Android device compatible with Expo Go.
- The application has access to its local application storage.
- SQLite is available through the selected Expo SDK and compatible `expo-sqlite` version.
- The application is intended for one local user per installation.
- Application data is not automatically synchronized or backed up to a cloud service.

# 3. Functional Requirements

Functional requirements describe the actions and services that the application must provide.

## 3.1 Movie and Series Collection

**FR-01 — View Collection**

The system shall display all saved movies and series in the user's collection.

Acceptance Criteria:

- The application displays saved entries.
- Each entry displays its title, content type, and viewing status.
- The collection updates after successful data modifications.
- An empty-state message appears when no entries exist.

## 3.2 Add Movie or Series

**FR-02 — Add Entry**

The system shall allow users to add a new movie or series.

Required information:

- Title
- Content type
- Viewing status

Optional information:

- Genre
- Release year
- Description
- Personal rating

Acceptance Criteria:

- The title cannot be empty.
- The user must select a valid content type.
- The user must select a valid viewing status.
- The application saves valid entries into SQLite.
- Newly created entries appear in the collection.

## 3.3 Edit Entry

**FR-03 — Edit Entry**

The system shall allow users to modify information associated with an existing entry.

Acceptance Criteria:

- Existing information is displayed in the editing form.
- Users can modify supported fields.
- Required field validation is applied.
- Changes are saved to SQLite.
- The updated information appears in the collection.

## 3.4 Delete Entry

**FR-04 — Delete Entry**

The system shall allow users to delete an existing movie or series.

Acceptance Criteria:

- The application requests confirmation before deletion.
- The entry is permanently removed from the local database after confirmation.
- Canceling the confirmation must preserve the entry.
- The collection refreshes after successful deletion.

## 3.5 Viewing Status Management

**FR-05 — Manage Viewing Status**

The system shall allow users to assign one of the following statuses:

| Status    | Description                           |
| --------- | ------------------------------------- |
| To Watch  | Titles the user plans to watch        |
| Watching  | Titles currently being watched        |
| Completed | Titles the user has finished watching |

Acceptance Criteria:

- Each entry has exactly one valid viewing status.
- Users can change the status of an existing entry.
- Status changes are persisted in SQLite.

## 3.6 View Entry Details

**FR-06 — View Details**

The system shall allow users to view the complete information of a selected entry.

Acceptance Criteria:

- The application displays the title, type, genre, release year, status, rating, and description when available.
- Missing optional information is handled appropriately.
- Users can navigate back to the collection.

## 3.7 Search

**FR-07 — Search Entries**

The system shall allow users to search their collection using a title.

Acceptance Criteria:

- Search results match the entered title.
- Search is case-insensitive.
- Partial title matches are supported.
- An appropriate message appears when no results are found.

## 3.8 Content Type Filter

**FR-08 — Filter by Content Type**

The system shall allow users to filter their collection by:

- All
- Movie
- Series

Acceptance Criteria:

- Selecting a filter displays only matching entries.
- Selecting All displays the complete collection.
- Filtering does not modify stored data.

## 3.9 Viewing Status Filter

**FR-09 — Filter by Viewing Status**

The system shall allow users to filter their collection by:

- All
- To Watch
- Watching
- Completed

Acceptance Criteria:

- Only entries matching the selected status are displayed.
- Selecting All restores the complete status collection.
- Filtering does not modify stored data.

## 3.10 Personal Rating

**FR-10 — Assign Personal Rating**

The system shall allow users to assign a personal rating to a movie or series.

Rating scale: 1.0–5.0.

Acceptance Criteria:

- Ratings must be within the supported range.
- Ratings can be updated.
- Users may leave the rating empty.
- Rating changes are persisted in SQLite.

## 3.11 Collection Statistics

**FR-11 — Display Collection Statistics (Could Have)**

The system may display a summary of the user's collection.

Possible information:

- Total entries.
- Total movies.
- Total series.
- Total completed entries.
- Total entries currently being watched.

## 3.12 Sorting

**FR-12 — Sort Collection (Could Have)**

The system may allow users to sort entries by:

- Title (A–Z).
- Title (Z–A).
- Recently added.

# 4. Non-Functional Requirements

## 4.1 Performance

**NFR-01**

The application should display normal collection data without noticeable delays under ordinary device conditions.

## 4.2 Data Persistence

**NFR-02**

All saved entries must remain available after the application is closed and reopened, provided the application data has not been cleared or the application uninstalled.

## 4.3 Offline Availability

**NFR-03**

All primary features must function without an active internet connection.

## 4.4 Usability

**NFR-04**

The application must provide understandable navigation, readable text, and clear feedback for user actions.

## 4.5 User Interface Consistency

**NFR-05**

The application must use a consistent dark theme, including colors, typography, spacing, and interactive elements.

## 4.6 Data Integrity

**NFR-06**

The application must validate user input before saving or updating records.

Invalid or incomplete required data must not be stored.

## 4.7 Compatibility

**NFR-07**

The application must run on supported Android devices using a compatible Expo Go environment during development.

## 4.8 Maintainability

**NFR-08**

The application code should be organized into reusable components and separated logical modules to support future maintenance.

# 5. Data Requirements

## 5.1 Movie and Series Entity

The application shall maintain a primary entity named `media`.

| Attribute    | Type    | Constraint                  |
| ------------ | ------- | --------------------------- |
| id           | INTEGER | Primary Key, Auto Increment |
| title        | TEXT    | NOT NULL                    |
| type         | TEXT    | NOT NULL, MOVIE or SERIES   |
| genre        | TEXT    | Nullable                    |
| release_year | INTEGER | Nullable                    |
| status       | TEXT    | NOT NULL                    |
| rating       | REAL    | Nullable, 1.0–5.0           |
| description  | TEXT    | Nullable                    |
| created_at   | TEXT    | NOT NULL                    |
| updated_at   | TEXT    | NOT NULL                    |

## 5.2 Data Validation

- Title must contain at least one non-whitespace character.
- Content type must be MOVIE or SERIES.
- Status must be TO_WATCH, WATCHING, or COMPLETED.
- Rating must be between 1.0 and 5.0 when provided.
- Release year must be a valid year when provided.
- Optional fields may remain empty.

# 6. External Interface Requirements

## 6.1 User Interface

The application shall provide:

- A collection screen.
- An add-entry screen or form.
- An edit-entry screen or form.
- An entry detail screen.
- Search and filter controls.

## 6.2 Hardware Interface

The application shall operate on a compatible Android smartphone.

No specialized hardware is required.

## 6.3 Software Interface

The application shall interact with:

- Android operating system.
- Expo runtime.
- React Native framework.
- Local SQLite database through expo-sqlite.

No external API integration is required.

# 7. Business Rules

| ID    | Rule                                                   |
| ----- | ------------------------------------------------------ |
| BR-01 | Every entry must have a title.                         |
| BR-02 | Every entry must have a content type.                  |
| BR-03 | Every entry must have exactly one viewing status.      |
| BR-04 | Personal ratings are optional.                         |
| BR-05 | Personal ratings must be between 1.0 and 5.0.          |
| BR-06 | Each entry must have a unique database ID.             |
| BR-07 | Deletion requires user confirmation.                   |
| BR-08 | Search and filtering must not modify database records. |

# 8. Acceptance Criteria

The application is considered to satisfy its core requirements when:

1. Users can create movie and series entries.
2. Users can view their saved collection.
3. Users can access entry details.
4. Users can edit existing entries.
5. Users can delete entries after confirmation.
6. Users can update viewing statuses.
7. Users can search by title.
8. Users can filter by content type and status.
9. Users can assign personal ratings.
10. Saved data persists after application restart.
11. Primary features remain usable without internet access.
12. Required input validation works correctly.

# 9. Out of Scope

The following features are explicitly excluded from this project:

- User registration and authentication.
- Cloud database and synchronization.
- Online movie streaming.
- External movie database integration.
- Automatic poster retrieval.
- Social features and sharing.
- Multiple user profiles.
- Online recommendations.
- Payment and subscription features.

---

**End of Document**

Document ID: CT-SRS-001\
Version: 1.0\
Project: CineTrack