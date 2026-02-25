package com.smartcampus.notification;

import com.smartcampus.user.User;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByRecipientAndDeletedFalse(User recipient, Pageable pageable);

    long countByRecipientAndIsReadFalseAndDeletedFalse(User recipient);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Notification n set n.isRead = true where n.id = :id and n.recipient = :recipient")
    int markRead(@Param("id") UUID id, @Param("recipient") User recipient);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Notification n set n.deleted = true where n.id = :id and n.recipient = :recipient")
    int softDelete(@Param("id") UUID id, @Param("recipient") User recipient);
}
