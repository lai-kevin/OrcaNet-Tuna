module github.com/lai-kevin/OrcaNet-Tuna

go 1.20

require github.com/creack/pty v1.1.24

//change this later (remove it after push to main)
replace github.com/lai-kevin/OrcaNet-Tuna/server/handlers => ./server/handlers

replace github.com/lai-kevin/OrcaNet-Tuna/server/manager => ./server/manager
