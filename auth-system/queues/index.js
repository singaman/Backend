const Queue = require('bull');

// Create queues
const imageQueue = new Queue('image processing', {
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: process.env.REDIS_PORT || 6379,
		password: process.env.REDIS_PASSWORD || undefined
	},
	defaultJobOptions: {
		removeOnComplete: 10,
		removeOnFail: 50,
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 2000
		}
	}
});

const emailQueue = new Queue('email processing', {
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: process.env.REDIS_PORT || 6379,
		password: process.env.REDIS_PASSWORD || undefined
	},
	defaultJobOptions: {
		removeOnComplete: 10,
		removeOnFail: 50,
		attempts: 5,
		backoff: {
			type: 'exponential',
			delay: 3000
		}
	}
});

// Import processors
const imageProcessor = require('./processors/imageProcessor');
const emailProcessor = require('./processors/emailProcessor');
if (typeof imageProcessor === 'function') {
	imageProcessor(imageQueue);
}
if (typeof emailProcessor === 'function') {
	emailProcessor(emailQueue);
}

// Queue monitoring (optional - for development)
if (process.env.NODE_ENV === 'development') {
	imageQueue.on('completed', (job) => {
		console.log(`✅ Image job ${job.id} completed`);
	});

	imageQueue.on('failed', (job, err) => {
		console.log(`❌ Image job ${job.id} failed: ${err.message}`);
	});

	emailQueue.on('completed', (job) => {
		console.log(`📧 Email job ${job.id} completed`);
	});

	emailQueue.on('failed', (job, err) => {
		console.log(`❌ Email job ${job.id} failed: ${err.message}`);
	});
}

module.exports = {
	imageQueue,
	emailQueue
};
