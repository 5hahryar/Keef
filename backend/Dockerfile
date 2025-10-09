FROM --platform=arm64 golang:alpine AS builder

ENV CGO_ENABLED=1 \
    GOOS=linux \
    GOARCH=arm64

WORKDIR /app

# Install build dependencies in a single RUN command
RUN apk add --no-cache clang lld musl-dev gcc

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o main .

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/main .

CMD ["./main"]