module github.com/lai-kevin/OrcaNet-Tuna

go 1.20

require github.com/creack/pty v1.1.24

require (
	github.com/google/uuid v1.6.0 
	github.com/rs/cors v1.11.1 
)

//change this later (remove it after push to main)
replace github.com/lai-kevin/OrcaNet-Tuna/server/handlers => ./server/handlers

replace github.com/lai-kevin/OrcaNet-Tuna/server/manager => ./server/manager
