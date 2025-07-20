# BluenNote Makefile for uv environment

.PHONY: install dev run clean sync lock update test

# 国内镜像源
INDEX_URL = https://mirrors.aliyun.com/pypi/simple/

# 安装依赖
install:
	uv sync --python python3 --index-url $(INDEX_URL)

# 开发模式安装（包含开发依赖）
dev:
	uv sync --dev --python python3 --index-url $(INDEX_URL)

# 运行应用
run:
	uv run python main.py

# 运行应用（使用启动脚本）
start:
	uv run python run.py

# 清理缓存
clean:
	uv cache clean

# 同步依赖
sync:
	uv sync --python python3 --index-url $(INDEX_URL)

# 锁定依赖版本
lock:
	uv lock --python python3 --index-url $(INDEX_URL)

# 更新依赖
update:
	uv lock --upgrade --python python3 --index-url $(INDEX_URL)

# 添加新依赖
add:
	@echo "Usage: make add PACKAGE=package_name"
	@if [ -n "$(PACKAGE)" ]; then uv add $(PACKAGE) --python python3 --index-url $(INDEX_URL); else echo "Please specify PACKAGE=package_name"; fi

# 添加开发依赖
add-dev:
	@echo "Usage: make add-dev PACKAGE=package_name"
	@if [ -n "$(PACKAGE)" ]; then uv add --dev $(PACKAGE) --python python3 --index-url $(INDEX_URL); else echo "Please specify PACKAGE=package_name"; fi

# 移除依赖
remove:
	@echo "Usage: make remove PACKAGE=package_name"
	@if [ -n "$(PACKAGE)" ]; then uv remove $(PACKAGE); else echo "Please specify PACKAGE=package_name"; fi

# 显示依赖树
tree:
	uv tree

# 运行数据库迁移
migrate:
	uv run alembic upgrade head

# 创建新的数据库迁移
migration:
	@echo "Usage: make migration MESSAGE='migration message'"
	@if [ -n "$(MESSAGE)" ]; then uv run alembic revision --autogenerate -m "$(MESSAGE)"; else echo "Please specify MESSAGE='migration message'"; fi

# 显示帮助
help:
	@echo "Available commands:"
	@echo "  install     - 安装依赖"
	@echo "  dev         - 开发模式安装"
	@echo "  run         - 运行应用"
	@echo "  start       - 使用启动脚本运行应用"
	@echo "  clean       - 清理缓存"
	@echo "  sync        - 同步依赖"
	@echo "  lock        - 锁定依赖版本"
	@echo "  update      - 更新依赖"
	@echo "  add         - 添加新依赖 (PACKAGE=package_name)"
	@echo "  add-dev     - 添加开发依赖 (PACKAGE=package_name)"
	@echo "  remove      - 移除依赖 (PACKAGE=package_name)"
	@echo "  tree        - 显示依赖树"
	@echo "  migrate     - 运行数据库迁移"
	@echo "  migration   - 创建新的数据库迁移 (MESSAGE='message')"
	@echo "  help        - 显示此帮助信息"
	@echo ""
	@echo "注意: 项目已配置国内镜像源以加速包下载"