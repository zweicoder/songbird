
### Create SQL Migration
```
migrate create -ext sql -dir migrations/ <name>
```

### Running Migrations
```
migrate -path ./migrations -database 'postgres://postgres:postgres@localhost/songbird?sslmode=disable' <up/down> <version_number>
```
