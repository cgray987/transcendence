# Header
define HEADER                            
$(BCYAN) _                                 _                 
| |_ ___ ___ ___ ___ ___ ___ ___ _| |___ ___ ___ ___ 
|  _|  _| .'|   |_ -|  _| -_|   | . | -_|   |  _| -_|
|_| |_| |__,|_|_|___|___|___|_|_|___|___|_|_|___|___|
                                                     $(NC)
endef


NAME = transcendence
SRCS = srcs

# Colors
GREEN		=	\e[92;5;118m
GRAY		=	\e[33;2;37m
RED			=	\033[31m
BCYAN		=	\033[96m
NC			=	\033[0m


export HEADER
all: $(NAME)

$(NAME):
	@echo "$$HEADER"
	@echo "$(BCYAN)~~ Running server: $(GREEN)$(NAME)$(BCYAN)~~$(NC)"
	docker compose up --remove-orphans -d
	@echo "$(BCYAN)~~ Server running in detached mode ~~$(NC)"

build:
	@echo "$(BCYAN)~~ Building server $(NAME)~~$(NC)"
	docker compose build --no-cache

stop:
	@echo "$(RED)!! Stopping server: $(GREEN)$(NAME)$(RED) !!$(NC)"
	docker stop $(shell docker ps -aq)

prune:
	@echo "$(RED)!! Pruning all stopped containers !!$(NC)"
	docker container prune -f

clean:
	@echo "$(RED)!! Pruning images, containers, and networks !! $(NC)"
	docker system prune

iclean:
	@echo "$(RED)!! Removing unused images !!$(NC)"
	docker images
	docker image prune -a

vclean:
	@echo "$(RED)!! Removing unused volumes from: $(GREEN)$(NAME)$(RED) !!$(NC)"
	docker volume ls
	docker volume prune

status:
	@echo "$(GREEN)>> DOCKER CONTAINERS:$(NC)"
	@docker ps -a
	@echo "\n$(GREEN)>> DOCKER IMAGES:$(NC)"
	@docker images
	@echo "\n$(GREEN)>> DOCKER VOLUMES:$(NC)"
	@docker volume ls

docker_shell:
	docker exec -it transcendence-web /bin/bash
