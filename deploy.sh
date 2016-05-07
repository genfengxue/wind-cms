#!/bin/bash
git pull
pm2 restart cms
tailf ~/.pm2/logs/cms-out-*.log
