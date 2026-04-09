package com.smartcampus.resource.repository;

import com.smartcampus.resource.enums.ResourceStatus;
import com.smartcampus.resource.enums.ResourceType;
import com.smartcampus.resource.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    // Filter by type
    List<Resource> findByType(ResourceType type);

    // Filter by status
    List<Resource> findByStatus(ResourceStatus status);

    // Filter by location (partial match)
    List<Resource> findByLocationContainingIgnoreCase(String location);

    // Filter by minimum capacity
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);

    // Search with multiple optional filters
    @Query("SELECT r FROM Resource r WHERE " +
            "(:type IS NULL OR r.type = :type) AND " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
            "(:capacity IS NULL OR r.capacity >= :capacity) AND " +
            "(:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Resource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("capacity") Integer capacity,
            @Param("search") String search
    );
}