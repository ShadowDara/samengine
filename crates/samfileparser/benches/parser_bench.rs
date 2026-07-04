use criterion::{black_box, criterion_group, criterion_main, Criterion};
use samfileparser::{
    init::{ErrorMode, RunConfig},
    parse,
};

include!(concat!(env!("OUT_DIR"), "/builtin_filtered.rs"));

fn make_conf() -> RunConfig {
    RunConfig {
        debug: false,
        errorMode: ErrorMode::FailFast,
    }
}

fn build_big_samfile() -> String {
    let mut s = String::new();

    for i in 0..1000 {
        s.push_str(&format!(
            "
task{}:
    env KEY=value
    run echo hello {}
    mkdir dir{}
    touch file{}.txt
    rm file{}.txt
",
            i, i, i, i, i
        ));
    }

    s
}

// ------------------- BENCH 1 -------------------

fn bench_parse_big(c: &mut Criterion) {
    let input = build_big_samfile();
    let conf = make_conf();

    c.bench_function("parse_big_samfile", |b| {
        b.iter(|| {
            let tasks = parse(black_box(&input), &conf);
            black_box(tasks);
        });
    });
}

// ------------------- BENCH 2 -------------------

fn bench_parse_builtin(c: &mut Criterion) {
    let conf = make_conf();

    c.bench_function("parse_builtin", |b| {
        b.iter(|| {
            let tasks = parse(black_box(BUILTIN_SAMFILE), &conf);
            black_box(tasks);
        });
    });
}

// ------------------- GROUP -------------------

criterion_group!(benches, bench_parse_big, bench_parse_builtin);
criterion_main!(benches);
