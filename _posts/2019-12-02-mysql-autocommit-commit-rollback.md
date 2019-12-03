---
title: "MySQL: autocommit, Commit, and Rollback"
tags:
  - "database"
  - "mysql"
  - "transaction"
  - "commit"
  - "rollback"
---

MySQL의 autocommit에 대해 기억이 가물가물하여 *5.7*버전의 '14.7.2.2 autocommit, Commit, and Rollback' 메뉴얼을
이름은 *역기*요, 성이 *번*씨인 조력자(?)와 함께 번역 해보았습니다.

# 14.7.2.2 autocommit, Commit, and Rollback

InnoDB에서 모든 사용자 활동은 트랜잭션 내에서 발생합니다. *autocommit* 모드가 사용 가능한 경우 각 SQL문은 자체적으로 단일 트랜잭션을 형성합니다. 기본적으로 MySQL은 *autocommit*이 활성화된 상태에서 새 연결마다 세션을 시작합니다. 입력된 명령문이 오류를 발생시키지 않으면 MySQL은 각 SQL문 후에 커밋을 수행합니다. 명령문이 오류를 발생시길 경우 커밋 또는 롤백 동작은 오류에 따라 달라집니다. 자세한 내용은 [14.22.4, “InnoDB Error Handling” 절](https://dev.mysql.com/doc/refman/5.7/en/innodb-error-handling.html)을 참고해주세요.

*autocommit*이 사용 가능한 세션은 `START TRANSACTION` 또는 `BEGIN` 문으로 명시적으로 시작하여 `COMMIT` 또는 `ROLLBACK`문으로 종료하여 다중 명령문 트랜잭션을 수행 할 수 있습니다. 자세한 내용은 [13.3.1, “START TRANSACTION, COMMIT, and ROLLBACK Statements” 절](https://dev.mysql.com/doc/refman/5.7/en/commit.html)을 참고해주세요.

`SET autocommit = 0` 명령문을 통해 세션에서 *autocommit* 모드를 비활성화하면 해당 세션은 항상 트랜잭션이 열려 있습니다. `COMMIT` 또는 `ROLLBACK`문은 현재 트랜잭션을 종료하고 새 트랜잭션을 시작합니다.

*autocommit*이 비활성화된 세션이 최종 트랜잭션을 명시적으로 커밋하지 않고 종료되면 MySQL은 해당 트랜잭션을 롤백합니다.

일부 명령문은 명령문을 실행하기 전에 `COMMIT`을 수행한 것처럼 트랜잭션을 암시적으로 종료합니다. 자세한 내용은 [13.3.3, “Statements That Cause an Implicit Commit” 절](https://dev.mysql.com/doc/refman/5.7/en/implicit-commit.html)을 참고하길 바랍니다.

`COMMIT`은 현재 트랜잭션에서 작성된 변경 사항이 영구적이며 다른 세션에서 볼 수 있음을 의미합니다. 반면에 `ROLLBACK`은 현재 트랜잭션에 의해 작성된 모든 수정 사항을 취소합니다. `COMMIT` 및 `ROLLBACK`은 현재 트랜잭션에서 설정된 모든 InnoDB 잠금을 해제합니다.

## 트랜잭션과 DML 작업 그룹화

기본적으로 MySQL 서버에 대한 연결은 *autocommit* 모드가 활성화된 상태에서 시작하여 실행 시 모든 SQL문을 자동으로 커밋합니다. 다른 데이터베이스 시스템에 대한 사용 경험이 있는 경우 이 작동 모드는 익숙하지 않을 수 있습니다. 여기서 DML문 시퀀스를 발행하고 커밋하거나 모두 롤백하는 것이 표준 관행입니다.

다중 명령문 트랜잭션을 사용하려면 `SET autocommit = 0` 명령문으로 *autocommit*을 끄고 각 트랜잭션을 적절하게 `COMMIT` 또는 `ROLLBACK`으로 종료할 수 있습니다. *autocommit을* 유지하려면 `START TRANSACTION`나 `BEGIN`으로 각 트랜잭션을 시작하고 `COMMIT` 또는 `ROLLBACK`으로 종료할 수 있습니다. 다음 예제는 두 개의 트랜잭션을 보여줍니다. 첫 번째는 커밋되고 두 번째는 롤백됩니다.

```shell
shell> mysql test
```

```sql
mysql> CREATE TABLE customer (a INT, b CHAR (20), INDEX (a));
Query OK, 0 rows affected (0.00 sec)
mysql> -- Do a transaction with autocommit turned on.
mysql> START TRANSACTION;
Query OK, 0 rows affected (0.00 sec)
mysql> INSERT INTO customer VALUES (10, 'Heikki');
Query OK, 1 row affected (0.00 sec)
mysql> COMMIT;
Query OK, 0 rows affected (0.00 sec)
mysql> -- Do another transaction with autocommit turned off.
mysql> SET autocommit=0;
Query OK, 0 rows affected (0.00 sec)
mysql> INSERT INTO customer VALUES (15, 'John');
Query OK, 1 row affected (0.00 sec)
mysql> INSERT INTO customer VALUES (20, 'Paul');
Query OK, 1 row affected (0.00 sec)
mysql> DELETE FROM customer WHERE b = 'Heikki';
Query OK, 1 row affected (0.00 sec)
mysql> -- Now we undo those last 2 inserts and the delete.
mysql> ROLLBACK;
Query OK, 0 rows affected (0.00 sec)
mysql> SELECT * FROM customer;
+------+--------+
| a    | b      |
+------+--------+
|   10 | Heikki |
+------+--------+
1 row in set (0.00 sec)
mysql>
```

## 클라이언트 측 언어에서의 트랜잭션

PHP, Perl DBI, JDBC, ODBC 또는 MySQL의 표준 C 호출 인터페이스와 같은 API에서 `COMMIT`과 같은 트랜잭션 제어 명령문을 `SELECT` 또는 `INSERT`와 같은 다른 SQL문과 마찬가지로 문자열로 MySQL 서버에 보낼 수 있습니다. 일부 API는 별도의 특수 트랜잭션 `COMMIT`과 및 `ROLLBACK` 함수 또는 메소드를 제공합니다.

# 마무리

> 원문: https://dev.mysql.com/doc/refman/5.7/en/innodb-autocommit-commit-rollback.html
