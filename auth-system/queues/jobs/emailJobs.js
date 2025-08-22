const { emailQueue } = require('../index');

class EmailJob {
  // Send welcome email
  static async sendWelcomeEmail(userId, email, firstName) {
    try {
      const job = await emailQueue.add('welcome', {
        userId,
        email,
        firstName
      }, {
        priority: 8,
        delay: 5000, // 5 second delay to ensure user is fully created
        attempts: 3
      });

      console.log(`Welcome email job queued: ${job.id} for ${email}`);
      return job;
    } catch (error) {
      console.error('Failed to queue welcome email:', error);
      throw error;
    }
  }

  // Send password reset email
  static async sendPasswordResetEmail(userId, email, firstName, resetToken) {
    try {
      const job = await emailQueue.add('passwordReset', {
        userId,
        email,
        firstName,
        resetToken
      }, {
        priority: 9, // High priority for security
        delay: 0,
        attempts: 5
      });

      console.log(`Password reset email job queued: ${job.id} for ${email}`);
      return job;
    } catch (error) {
      console.error('Failed to queue password reset email:', error);
      throw error;
    }
  }

  // Send security alert email
  static async sendSecurityAlert(userId, email, firstName, alertType, deviceInfo, ipAddress) {
    try {
      const job = await emailQueue.add('securityAlert', {
        userId,
        email,
        firstName,
        alertType,
        deviceInfo,
        ipAddress,
        timestamp: new Date()
      }, {
        priority: 10, // Highest priority for security alerts
        delay: 0,
        attempts: 5
      });

      console.log(`Security alert email job queued: ${job.id} for ${email}`);
      return job;
    } catch (error) {
      console.error('Failed to queue security alert email:', error);
      throw error;
    }
  }

  // Send email verification
  static async sendEmailVerification(userId, email, firstName, verificationToken) {
    try {
      const job = await emailQueue.add('emailVerification', {
        userId,
        email,
        firstName,
        verificationToken
      }, {
        priority: 7,
        delay: 1000, // 1 second delay
        attempts: 3
      });

      console.log(`Email verification job queued: ${job.id} for ${email}`);
      return job;
    } catch (error) {
      console.error('Failed to queue email verification:', error);
      throw error;
    }
  }

  // Send account deactivation email
  static async sendAccountDeactivation(userId, email, firstName, reason) {
    try {
      const job = await emailQueue.add('accountDeactivation', {
        userId,
        email,
        firstName,
        reason,
        timestamp: new Date()
      }, {
        priority: 6,
        delay: 0,
        attempts: 3
      });

      console.log(`Account deactivation email job queued: ${job.id} for ${email}`);
      return job;
    } catch (error) {
      console.error('Failed to queue account deactivation email:', error);
      throw error;
    }
  }

  // Get email job status
  static async getJobStatus(jobId) {
    try {
      const job = await emailQueue.getJob(jobId);
      if (!job) return null;

      return {
        id: job.id,
        type: job.name,
        progress: job.progress(),
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        data: job.data,
        opts: job.opts
      };
    } catch (error) {
      console.error('Failed to get email job status:', error);
      return null;
    }
  }

  // Get queue stats
  static async getQueueStats() {
    try {
      const waiting = await emailQueue.getWaiting();
      const active = await emailQueue.getActive();
      const completed = await emailQueue.getCompleted();
      const failed = await emailQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        totalJobs: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      console.error('Failed to get email queue stats:', error);
      return null;
    }
  }

  // Clean failed jobs
  static async cleanFailedJobs() {
    try {
      await emailQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 24 hours
      console.log('Failed email jobs cleaned successfully');
    } catch (error) {
      console.error('Failed to clean failed jobs:', error);
    }
  }
}

module.exports = EmailJob;
