package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/rpc"
	"github.com/gorilla/rpc/json"
)

type Args struct {
	A, B int
}

type Result struct {
	Sum int
}

type FileShareService struct{}

func (s *FileShareService) Add(r *http.Request, args *Args, result *Result) error {
	result.Sum = args.A + args.B
	fmt.Printf("Sum of %d and %d is %d\n", args.A, args.B, result.Sum)
	return nil
}

func startRPCServer() {
	s := rpc.NewServer()
	s.RegisterCodec(json.NewCodec(), "application/json")
	s.RegisterService(new(FileShareService), "")

	r := mux.NewRouter()
	r.Handle("/rpc", s)

	fmt.Println("Starting JSON-RPC server on port 1234")
	http.ListenAndServe(":1234", r)

	select {}
}
