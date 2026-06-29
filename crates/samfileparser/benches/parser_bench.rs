use criterion::{black_box, criterion_group, criterion_main, Criterion};
use samfileparser::parse;

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

fn bench_parser(c: &mut Criterion) {
    let input = build_big_samfile();

    c.bench_function("parse_big_samfile", |b| {
        b.iter(|| {
            let tasks = parse(black_box(&input));
            black_box(tasks);
        });
    });
}

criterion_group!(benches, bench_parser);
criterion_main!(benches);
