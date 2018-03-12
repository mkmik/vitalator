package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
)

var (
	listen = flag.String("listen", ":8080", "http addr:port")
)

func main() {
	flag.Parse()

	fs := http.FileServer(http.Dir("ui"))
	http.Handle("/", fs)

	log.Fatal(http.ListenAndServe(*listen, nil))

	fmt.Println("ok")
}
