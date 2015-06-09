wf-logger
=========

Logging library built on top of winston.

### Example Config Settings

#### Dev

```
  logger: {
    console: true,
    path: 'log/development.log'
  }

```

#### Production

```
  logger: {
    console: false,
    path: 'log/production.log',
    level: 'info',
    aws: {
      snsNotifyArn: 'arn:aws:sns:us-east-1....',
      snsErrorsArn: 'arn:aws:sns:us-east-1....'
    },
    papertrail: {
      host: 'logs.papertrailapp.com',
      port: 50175
    }
  }

```
