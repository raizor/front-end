import { ApplicationStatus } from "src/ts/models/ApplicationModel";

/**
 * Simple helper that converts a number (which is likely returned from the backend)
 * into the proper enum from the ApplicationStatus enumeration
 */
export function convertNumberToApplicationStatus(number: number, fallback?: ApplicationStatus): ApplicationStatus {
    switch (number) {
        case 0:
            return ApplicationStatus.OPEN;

        case 1:
            return ApplicationStatus.LOCKED;

        case 2:
            return ApplicationStatus.PENDING;

        case 3:
            return ApplicationStatus.COMPLETED

        case 4:
            return ApplicationStatus.UNAVAILABLE;

        case 5:
            return ApplicationStatus.WITHDRAWN;

        default:
            return fallback || ApplicationStatus.OPEN;
    }
}