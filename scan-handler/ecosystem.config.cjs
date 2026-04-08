module.exports = {
  apps: [
    {
      name: "codify-poller",
      script: "src/poller.js",
      cwd: "/Users/michaelscott/scan-handler",
      node_args: "--env-file=.env",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      exp_backoff_restart_delay: 100,
      max_memory_restart: "256M",
      error_file: "logs/poller-error.log",
      out_file: "logs/poller-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
