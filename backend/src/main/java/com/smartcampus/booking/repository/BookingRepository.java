package com.smartcampus.booking.repository;

import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    // Finds bookings that overlap the requested time slot
    // Two time ranges overlap when: startA < endB AND endA > startB
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resourceId = :resourceId
        AND b.bookingDate = :date
        AND b.status = 'APPROVED'
        AND b.startTime < :endTime
        AND b.endTime > :startTime
        """)
    List<Booking> findConflictingBookings(
        @Param("resourceId") String resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    // All approved bookings for a resource on a date, sorted by start time
    // Used by the Smart Slot Suggester
    @Query("""
        SELECT b FROM Booking b
        WHERE b.resourceId = :resourceId
        AND b.bookingDate = :date
        AND b.status = 'APPROVED'
        ORDER BY b.startTime ASC
        """)
    List<Booking> findApprovedBookingsByResourceAndDate(
        @Param("resourceId") String resourceId,
        @Param("date") LocalDate date
    );

    // User's own bookings, newest first
    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    // Filter all bookings by status (admin)
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
}