BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Department] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [code] NVARCHAR(1000) NOT NULL,
    [headUserId] NVARCHAR(1000),
    [parentDepartmentId] NVARCHAR(1000),
    [employeeCount] INT NOT NULL CONSTRAINT [Department_employeeCount_df] DEFAULT 0,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Department_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [Department_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Department_code_key] UNIQUE NONCLUSTERED ([code])
);

-- CreateTable
CREATE TABLE [dbo].[Category] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Category_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [Category_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmissionFactor] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [factorValue] FLOAT(53) NOT NULL,
    [unit] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [EmissionFactor_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [EmissionFactor_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EnvironmentalGoal] (
    [id] NVARCHAR(1000) NOT NULL,
    [departmentId] NVARCHAR(1000) NOT NULL,
    [targetEmissions] FLOAT(53) NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [EnvironmentalGoal_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [EnvironmentalGoal_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EsgPolicy] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [effectiveDate] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [EsgPolicy_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [EsgPolicy_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Badge] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [unlockRuleType] NVARCHAR(1000) NOT NULL,
    [unlockThreshold] INT NOT NULL,
    [iconUrl] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Badge_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Reward] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [pointsRequired] INT NOT NULL,
    [stock] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Reward_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [Reward_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [passwordHash] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'EMPLOYEE',
    [departmentId] NVARCHAR(1000),
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[CarbonTransaction] (
    [id] NVARCHAR(1000) NOT NULL,
    [departmentId] NVARCHAR(1000) NOT NULL,
    [sourceType] NVARCHAR(1000) NOT NULL,
    [quantity] FLOAT(53) NOT NULL,
    [emissionsValue] FLOAT(53) NOT NULL,
    [operationDate] DATETIME2 NOT NULL,
    [autoCalculated] BIT NOT NULL CONSTRAINT [CarbonTransaction_autoCalculated_df] DEFAULT 0,
    CONSTRAINT [CarbonTransaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CsrActivity] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [CsrActivity_status_df] DEFAULT 'PLANNED',
    CONSTRAINT [CsrActivity_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmployeeParticipation] (
    [id] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [csrActivityId] NVARCHAR(1000) NOT NULL,
    [proofPath] NVARCHAR(1000),
    [approvalStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [EmployeeParticipation_approvalStatus_df] DEFAULT 'PENDING',
    [pointsEarned] INT NOT NULL CONSTRAINT [EmployeeParticipation_pointsEarned_df] DEFAULT 0,
    [completionDate] DATETIME2,
    CONSTRAINT [EmployeeParticipation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Challenge] (
    [id] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [categoryId] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [xpAward] INT NOT NULL,
    [difficulty] NVARCHAR(1000) NOT NULL,
    [evidenceRequired] BIT NOT NULL CONSTRAINT [Challenge_evidenceRequired_df] DEFAULT 1,
    [deadline] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Challenge_status_df] DEFAULT 'ACTIVE',
    CONSTRAINT [Challenge_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ChallengeParticipation] (
    [id] NVARCHAR(1000) NOT NULL,
    [challengeId] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [progressPercent] INT NOT NULL CONSTRAINT [ChallengeParticipation_progressPercent_df] DEFAULT 0,
    [proofPath] NVARCHAR(1000),
    [approvalStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [ChallengeParticipation_approvalStatus_df] DEFAULT 'PENDING',
    [xpAwarded] INT NOT NULL CONSTRAINT [ChallengeParticipation_xpAwarded_df] DEFAULT 0,
    CONSTRAINT [ChallengeParticipation_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PolicyAcknowledgement] (
    [id] NVARCHAR(1000) NOT NULL,
    [policyId] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [acknowledgedAt] DATETIME2 NOT NULL CONSTRAINT [PolicyAcknowledgement_acknowledgedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PolicyAcknowledgement_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Audit] (
    [id] NVARCHAR(1000) NOT NULL,
    [departmentId] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [auditDate] DATETIME2 NOT NULL,
    [auditorId] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Audit_status_df] DEFAULT 'SCHEDULED',
    CONSTRAINT [Audit_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ComplianceIssue] (
    [id] NVARCHAR(1000) NOT NULL,
    [auditId] NVARCHAR(1000) NOT NULL,
    [severity] NVARCHAR(1000) NOT NULL,
    [description] TEXT NOT NULL,
    [ownerId] NVARCHAR(1000) NOT NULL,
    [dueDate] DATETIME2 NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [ComplianceIssue_status_df] DEFAULT 'OPEN',
    [flaggedOverdue] BIT NOT NULL CONSTRAINT [ComplianceIssue_flaggedOverdue_df] DEFAULT 0,
    CONSTRAINT [ComplianceIssue_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DepartmentScore] (
    [id] NVARCHAR(1000) NOT NULL,
    [departmentId] NVARCHAR(1000) NOT NULL,
    [environmentalScore] FLOAT(53) NOT NULL,
    [socialScore] FLOAT(53) NOT NULL,
    [governanceScore] FLOAT(53) NOT NULL,
    [totalScore] FLOAT(53) NOT NULL,
    [computedAt] DATETIME2 NOT NULL CONSTRAINT [DepartmentScore_computedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DepartmentScore_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EmployeeXpBalance] (
    [id] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [xpTotal] INT NOT NULL CONSTRAINT [EmployeeXpBalance_xpTotal_df] DEFAULT 0,
    [pointsTotal] INT NOT NULL CONSTRAINT [EmployeeXpBalance_pointsTotal_df] DEFAULT 0,
    CONSTRAINT [EmployeeXpBalance_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [EmployeeXpBalance_employeeId_key] UNIQUE NONCLUSTERED ([employeeId])
);

-- CreateTable
CREATE TABLE [dbo].[BadgeAssignment] (
    [id] NVARCHAR(1000) NOT NULL,
    [badgeId] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [awardedAt] DATETIME2 NOT NULL CONSTRAINT [BadgeAssignment_awardedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [source] NVARCHAR(1000),
    CONSTRAINT [BadgeAssignment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[RewardRedemption] (
    [id] NVARCHAR(1000) NOT NULL,
    [rewardId] NVARCHAR(1000) NOT NULL,
    [employeeId] NVARCHAR(1000) NOT NULL,
    [pointsSpent] INT NOT NULL,
    [redeemedAt] DATETIME2 NOT NULL CONSTRAINT [RewardRedemption_redeemedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [RewardRedemption_status_df] DEFAULT 'APPROVED',
    CONSTRAINT [RewardRedemption_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Notification] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [body] TEXT NOT NULL,
    [relatedEntityType] NVARCHAR(1000),
    [relatedEntityId] NVARCHAR(1000),
    [readAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Notification_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Notification_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[EsgConfiguration] (
    [id] NVARCHAR(1000) NOT NULL,
    [envWeight] FLOAT(53) NOT NULL,
    [socialWeight] FLOAT(53) NOT NULL,
    [governanceWeight] FLOAT(53) NOT NULL,
    [autoEmissionEnabled] BIT NOT NULL CONSTRAINT [EsgConfiguration_autoEmissionEnabled_df] DEFAULT 1,
    [evidenceRequiredEnabled] BIT NOT NULL CONSTRAINT [EsgConfiguration_evidenceRequiredEnabled_df] DEFAULT 1,
    [badgeAutoAwardEnabled] BIT NOT NULL CONSTRAINT [EsgConfiguration_badgeAutoAwardEnabled_df] DEFAULT 1,
    CONSTRAINT [EsgConfiguration_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[NotificationSettings] (
    [id] NVARCHAR(1000) NOT NULL,
    [emailEnabled] BIT NOT NULL CONSTRAINT [NotificationSettings_emailEnabled_df] DEFAULT 1,
    [inAppEnabled] BIT NOT NULL CONSTRAINT [NotificationSettings_inAppEnabled_df] DEFAULT 1,
    [notifyOnComplianceIssue] BIT NOT NULL CONSTRAINT [NotificationSettings_notifyOnComplianceIssue_df] DEFAULT 1,
    [notifyOnComplianceOverdue] BIT NOT NULL CONSTRAINT [NotificationSettings_notifyOnComplianceOverdue_df] DEFAULT 1,
    [notifyOnCsrApproval] BIT NOT NULL CONSTRAINT [NotificationSettings_notifyOnCsrApproval_df] DEFAULT 1,
    [notifyOnChallengeApproval] BIT NOT NULL CONSTRAINT [NotificationSettings_notifyOnChallengeApproval_df] DEFAULT 1,
    [notifyOnPolicyReminder] BIT NOT NULL CONSTRAINT [NotificationSettings_notifyOnPolicyReminder_df] DEFAULT 1,
    [notifyOnBadgeUnlock] BIT NOT NULL CONSTRAINT [NotificationSettings_notifyOnBadgeUnlock_df] DEFAULT 1,
    CONSTRAINT [NotificationSettings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Department] ADD CONSTRAINT [Department_headUserId_fkey] FOREIGN KEY ([headUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Department] ADD CONSTRAINT [Department_parentDepartmentId_fkey] FOREIGN KEY ([parentDepartmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EnvironmentalGoal] ADD CONSTRAINT [EnvironmentalGoal_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CarbonTransaction] ADD CONSTRAINT [CarbonTransaction_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CsrActivity] ADD CONSTRAINT [CsrActivity_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[Category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmployeeParticipation] ADD CONSTRAINT [EmployeeParticipation_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmployeeParticipation] ADD CONSTRAINT [EmployeeParticipation_csrActivityId_fkey] FOREIGN KEY ([csrActivityId]) REFERENCES [dbo].[CsrActivity]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Challenge] ADD CONSTRAINT [Challenge_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[Category]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChallengeParticipation] ADD CONSTRAINT [ChallengeParticipation_challengeId_fkey] FOREIGN KEY ([challengeId]) REFERENCES [dbo].[Challenge]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ChallengeParticipation] ADD CONSTRAINT [ChallengeParticipation_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PolicyAcknowledgement] ADD CONSTRAINT [PolicyAcknowledgement_policyId_fkey] FOREIGN KEY ([policyId]) REFERENCES [dbo].[EsgPolicy]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PolicyAcknowledgement] ADD CONSTRAINT [PolicyAcknowledgement_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Audit] ADD CONSTRAINT [Audit_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Audit] ADD CONSTRAINT [Audit_auditorId_fkey] FOREIGN KEY ([auditorId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ComplianceIssue] ADD CONSTRAINT [ComplianceIssue_auditId_fkey] FOREIGN KEY ([auditId]) REFERENCES [dbo].[Audit]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ComplianceIssue] ADD CONSTRAINT [ComplianceIssue_ownerId_fkey] FOREIGN KEY ([ownerId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[DepartmentScore] ADD CONSTRAINT [DepartmentScore_departmentId_fkey] FOREIGN KEY ([departmentId]) REFERENCES [dbo].[Department]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[EmployeeXpBalance] ADD CONSTRAINT [EmployeeXpBalance_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[BadgeAssignment] ADD CONSTRAINT [BadgeAssignment_badgeId_fkey] FOREIGN KEY ([badgeId]) REFERENCES [dbo].[Badge]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[BadgeAssignment] ADD CONSTRAINT [BadgeAssignment_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RewardRedemption] ADD CONSTRAINT [RewardRedemption_rewardId_fkey] FOREIGN KEY ([rewardId]) REFERENCES [dbo].[Reward]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[RewardRedemption] ADD CONSTRAINT [RewardRedemption_employeeId_fkey] FOREIGN KEY ([employeeId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Notification] ADD CONSTRAINT [Notification_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
