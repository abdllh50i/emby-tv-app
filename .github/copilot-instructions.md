# Copilot Instructions for emby-tv-app

## Project Overview

This is an Emby TV application designed for TV platforms. Emby is a media server solution that allows users to organize, stream, and manage their personal media collections.

## Technology Stack

- This is a TV application project for the Emby media server platform
- Target platforms: Smart TVs and TV-based devices

## Code Style and Conventions

### General Guidelines

- Write clean, readable, and maintainable code
- Follow consistent naming conventions throughout the codebase
- Keep functions small and focused on a single responsibility
- Add comments for complex logic, but prefer self-documenting code

### Naming Conventions

- Use descriptive variable and function names
- Follow camelCase for JavaScript/TypeScript variables and functions
- Use PascalCase for classes and components
- Use UPPERCASE for constants

## Development Workflow

### Before Making Changes

1. Understand the existing code structure and patterns
2. Check for similar implementations in the codebase
3. Consider the impact on TV user experience (remote control navigation, focus management)

### Testing

- Test changes thoroughly on target TV platforms when possible
- Consider various screen sizes and resolutions
- Verify remote control navigation and interaction
- Test performance on resource-constrained TV devices

## TV-Specific Considerations

### User Interface

- Design for 10-foot viewing distance (larger UI elements)
- Ensure high contrast for readability on TV screens
- Consider safe zones for content (TV overscan)
- Optimize for remote control navigation (up, down, left, right, select, back)

### Performance

- Optimize for limited TV hardware capabilities
- Minimize memory usage
- Ensure smooth scrolling and transitions
- Lazy-load images and content when possible

### Navigation

- Implement clear focus indicators
- Ensure logical focus flow between UI elements
- Handle back button and home button navigation
- Support spatial navigation (directional pad)

## File Organization

- Keep related files together in logical directories
- Separate UI components from business logic
- Organize media-related code (players, codecs, streaming) separately
- Group TV-specific adaptations and utilities

## Emby Integration

- Follow Emby API conventions and best practices
- Handle authentication and session management properly
- Implement proper error handling for network requests
- Support Emby server discovery and connection
- Handle various media formats and streaming protocols

## Accessibility

- Support high contrast modes
- Provide audio cues where appropriate
- Ensure keyboard/remote navigation is intuitive
- Consider users with visual or motor impairments

## Documentation

- Update README.md when adding new features or changing setup procedures
- Document complex algorithms or business logic
- Keep API documentation up to date
- Include setup instructions for development environment
