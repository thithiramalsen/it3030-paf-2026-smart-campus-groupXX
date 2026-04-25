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

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
        AND b.bookingDate = :date
        AND b.status = 'APPROVED'
        AND b.startTime < :endTime
        AND b.endTime > :startTime
        """)
    List<Booking> findConflictingBookings(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime
    );

    @Query("""
        SELECT b FROM Booking b
        WHERE b.resource.id = :resourceId
        AND b.bookingDate = :date
        AND b.status = 'APPROVED'
        ORDER BY b.startTime ASC
        """)
    List<Booking> findApprovedBookingsByResourceAndDate(
        @Param("resourceId") Long resourceId,
        @Param("date") LocalDate date
    );

    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);
    long deleteByUserId(UUID userId);
}