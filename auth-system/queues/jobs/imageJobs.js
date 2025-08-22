const { imageQueue } = require('../index');

class ImageJob {
  // Add profile image processing job
  static async processProfileImage(userId, imageBuffer, filename, originalName) {
    try {
      const job = await imageQueue.add('processProfileImage', {
        userId,
        imageBuffer,
        filename,
        originalName
      }, {
        priority: 5,
        delay: 0,
        attempts: 3
      });

      console.log(`Image processing job queued: ${job.id} for user: ${userId}`);
      return job;
    } catch (error) {
      console.error('Failed to queue image processing job:', error);
      throw error;
    }
  }

  // Add profile image deletion job
  static async deleteProfileImage(userId, imagePaths) {
    try {
      const job = await imageQueue.add('deleteProfileImage', {
        userId,
        imagePaths
      }, {
        priority: 3,
        delay: 0
      });

      console.log(`Image deletion job queued: ${job.id} for user: ${userId}`);
      return job;
    } catch (error) {
      console.error('Failed to queue image deletion job:', error);
      throw error;
    }
  }

  // Add cleanup job (typically run via cron)
  static async cleanupOldImages(olderThanDays = 30) {
    try {
      const job = await imageQueue.add('cleanupOldImages', {
        olderThanDays
      }, {
        priority: 1,
        delay: 0
      });

      console.log(`Image cleanup job queued: ${job.id}`);
      return job;
    } catch (error) {
      console.error('Failed to queue image cleanup job:', error);
      throw error;
    }
  }

  // Get image processing status
  static async getJobStatus(jobId) {
    try {
      const job = await imageQueue.getJob(jobId);
      if (!job) return null;

      return {
        id: job.id,
        name: job.name,
        progress: job.progress(),
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        data: job.data,
        opts: job.opts
      };
    } catch (error) {
      console.error('Failed to get job status:', error);
      return null;
    }
  }

  // Get queue statistics
  static async getQueueStats() {
    try {
      const waiting = await imageQueue.getWaiting();
      const active = await imageQueue.getActive();
      const completed = await imageQueue.getCompleted();
      const failed = await imageQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length
      };
    } catch (error) {
      console.error('Failed to get queue stats:', error);
      return null;
    }
  }
}

module.exports = ImageJob;
