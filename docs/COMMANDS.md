# Remind Me CLI Commands

## init

```bash
reme init
```

## log

```bash
reme log YES https://polymarket.com/event/will-fed-cut-rates
reme log NO https://polymarket.com/event/super-bowl-winner --confidence 80
```

## list

```bash
reme list
reme list --pending
reme list --correct
```

## show

```bash
reme show <id>
reme show --market "eth etf"
```

## stats

```bash
reme stats
```

## check

```bash
reme check
reme check --watch --interval 900
```

## config

```bash
reme config
reme config set default_confidence 50
reme config set notifications true
```

## delete

```bash
reme delete <id>
```

## export

```bash
reme export --format json
reme export --format csv --output remindme.csv
reme export --format md
```
